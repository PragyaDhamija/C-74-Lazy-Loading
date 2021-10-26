import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  KeyboardAvoidingView,
  ToastAndroid
} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config';

export default class Transaction extends Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      scannedData: '',
      buttonState: 'normal',
      scannedBookId: '',
      scannedStudentId: '',
      transactionMesg: '',
    };
  }

  getCameraPermissions = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    /*status === "granted" is true when user has granted permission
      status === "granted" is false when user has not granted the permission
    */

    //destructuring assignment
    /*
      {x , y} = ball; ====> 
      ball.x = x;
      ball.y = y;
    */
    this.setState({
      hasCameraPermissions: status === 'granted',
      scanned: false,
      buttonState: id,
    });
  };

  handleBarCodeScanned = async ({ type, data }) => {
    // this.setState({
    //   scanned: true,
    //   scannedData: data,
    //   buttonState: 'normal'
    // })

    const { buttonState } = this.state;
    if (buttonState === 'BookId') {
      this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: 'normal',
      });
    } else if (buttonState === 'StudentId') {
      this.setState({
        scanned: true,
        buttonState: 'normal',
        scannedStudentId: data,
      });
    }
  };
  checkStudentEligibilityForBookIssue = async () => {

    const studentRef = await db.collection("students")
    .where("studentId", "==" , this.state.scannedStudentId)
    .get()

    var isStudentEligible = "";
    // 2 === '2' 
    // 2 == '2'
    if(studentRef.docs.length == 0 ){
      this.setState({
        scannedStudentId: "",
        scannedBookId: ""
      });
      isStudentEligible = false;
      alert("There is no such student !!")
    }
    else{
      studentRef.docs.map( doc => {
        var student = doc.data();
          if(student.noOfBooks<2){
            isStudentEligible = true;
          }
          else{
            isStudentEligible = false;
            alert("You have already issued 2 books")
            this.setState({
              scannedStudentId: "",
              scannedBookId: ""
            });
          }
      } )
    }

    return isStudentEligible;
  }
  checkStudentEligibilityForBookReturn = async () => {
    var tRef = await db.collection('transaction')
    .where('bookId', '==', this.state.scannedBookId)
    .limit(1)
    .get()

    var isStudentEligible = '';
    tRef.docs.map(i=>{
      var lastBookTransaction = i.data()
      if(lastBookTransaction.studentId === this.state.scannedStudentId){
        isStudentEligible = true
      }
      else{
        isStudentEligible = false
        alert("Book wasn't issued by this student")
        this.setState({
          scannedStudentId: "",
          scannedBookId: ""
        });
      }
    })
    return isStudentEligible;
    
  }

  checkBookAvailability = async () => {
    const bookRef = await db.collection('books')
      .where("bookId", "==", this.state.scannedBookId)
      .get()

    var transactionType = ''
    if (bookRef.docs.length === 0) {
      transactionType = false
    }
    else {
      bookRef.docs.map( doc => {
        var book = doc.data()
        console.log( book );
        if(book.bookAvailability){
          transactionType = "Issue"
        }
        else{
          transactionType = "Return"
        }
      })
    }

    return transactionType
  }



  handleTransaction = async () => {
    var transactionType = await this.checkBookAvailability();
    if ( !transactionType ) {
      alert("Book does not exist in library")
      this.setState({
        scannedBookId: '',
        scannedStudentId: '',
      });
    }
    else if (transactionType === "Issue") {
      var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
      if (isStudentEligible) {
        this.initiateBookIssue();
        alert("book issued")
      }
    }
    else if (transactionType === "Return") {
      var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
      if (isStudentEligible) {
        this.initiateBookReturn();
        alert("book returned")
      }
    }



    // var transactionMesg = null;
    // db.collection('books')
    //   .doc(this.state.scannedBookId)
    //   .get()
    //   .then((doc) => {
    //     var book = doc.data();
    //     console.log(book);
    //     if (book.bookAvailability) {
    //       this.initiateBookIssue();
    //       transactionMesg = 'Book Issued';
    //       ToastAndroid.show(transactionMesg,ToastAndroid.SHORT)
    //     } else {
    //       this.initiateBookReturn();
    //       transactionMesg = 'Book Returned';
    //       ToastAndroid.show(transactionMesg,ToastAndroid.SHORT)
    //     }
    //   });
    // this.setState({
    //   transactionMesg: transactionMesg,
    // });
  };
  initiateBookIssue = async () => {
    db.collection('transaction').add({
      studentId: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: 'Issue',
    });

    db.collection('books').doc(this.state.scannedBookId).update({
      bookAvailability: false,
    });

    db.collection('students')
      .doc(this.state.scannedStudentId)
      .update({
        noOfBooks: firebase.firestore.FieldValue.increment(1),
      });
    //alert('Book Issued');

    this.setState({
      scannedBookId: '',
      scannedStudentId: '',
    });
  };

  initiateBookReturn = async () => {
    db.collection('transaction').add({
      studentId: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: 'Return',
    });

    db.collection('books').doc(this.state.scannedBookId).update({
      bookAvailability: true,
    });
    db.collection('students')
      .doc(this.state.scannedStudentId)
      .update({
        noOfBooks: firebase.firestore.FieldValue.increment(-1),
      });
    //alert('Book Returned');

    this.setState({
      scannedBookId: '',
      scannedStudentId: '',
    });
  };

  render() {
    // const hasCameraPermissions = this.state.hasCameraPermissions;
    // const scanned = this.state.scanned;
    // const buttonState = this.state.buttonState;

    const { hasCameraPermissions, scanned, buttonState } = this.state;

    if (buttonState !== 'normal' && hasCameraPermissions) {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    } else if (buttonState === 'normal') {
      return (
        <KeyboardAvoidingView
          style={styles.container}
          behavior="padding"
          enabled>
          <Image
            source={require('../assets/booklogo.jpg')}
            style={{ width: 100, height: 100 }}
          />
          <Text style={styles.heading}>WILY</Text>
          <View style={styles.inputView}>
            <TextInput
              placeholder="Book ID"
              style={styles.inputBox}
              onChangeText={(infoT) => {
                this.setState({
                  scannedBookId: infoT,
                });
              }}
              value={this.state.scannedBookId}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => this.getCameraPermissions('BookId')}>
              <Text style={styles.buttonText}>SCAN</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputView}>
            <TextInput
              placeholder="Student ID"
              style={styles.inputBox}
              onChangeText={(infoT) => {
                this.setState({
                  scannedStudentId: infoT,
                });
              }}
              value={this.state.scannedStudentId}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => this.getCameraPermissions('StudentId')}>
              <Text style={styles.buttonText}>SCAN</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.submitB}
            onPress={async () => {
              await this.handleTransaction();
            }}>
            <Text style={styles.submitBText}> Submit </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayText: {
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    margin: 10,
  },
  buttonText: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
  },
  inputView: {
    flexDirection: 'row',
    margin: 20,
  },
  inputBox: {
    width: 200,
    height: 40,
    borderWidth: 1.5,
    borderRightWidth: 0,
    fontSize: 20,
    borderRadius: 10,
  },
  scanButton: {
    backgroundColor: '#66BB6A',
    width: 50,
    borderWidth: 1.5,
    borderLeftWidth: 0,
    borderRadius: 10,
  },
  heading: {
    textAlign: 'center',
    fontSize: 30,
    fontFamily: 'cursive',
    color: 'violet',
  },
  submitB: {
    backgroundColor: '#FBC02D',
    width: 170,
    height: 40,
    borderRadius: 10,
  },
  submitBText: {
    padding: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
