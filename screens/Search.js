import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import db from '../config';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allTransactions: [],
      lastVisibleTransaction: null,
      search: '',

    }
  }

  fetchMoreTransactions = async () => {
    //... is Spread operator
    // const query = await db.collection("transaction").startAfter(this.state.lastVisibleTransaction).limit(5).get()
    // query.docs.map((doc) => {
    //   this.setState({
    //     allTransactions: [...this.state.allTransactions, doc.data()],
    //     lastVisibleTransaction: doc
    //   })
    // })
    var text = this.state.search.toUpperCase()
    console.log(this.state.search.toUpperCase())
    var enteredText = text.split('')
    if(enteredText[0].toUpperCase() ==='B'){
      const s = await db.collection('transaction')
      .where('bookId','==','text')
      .startAfter(this.state.lastVisibleTransaction)
      .limit(10)
      .get()

      s.docs.map((doc)=>{
        this.setState({
          allTransactions : [...this.state.allTransactions,doc.data()],
          lastVisibleTransaction : doc
        })
      })
    }
    else if (enteredtext[0].toUpperCase() === 'S') {
      const s = await db
        .collection('transaction')
        .where('studentId', '==', text1)
        .startAfter(this.lastVisibleTransaction)
        .limit(10)
        .get();
      s.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    }

  }
  componentDidMount = async () => {

    const query = await db.collection("transaction").get();
    query.docs.map((doc) => {
      this.setState({
        allTransactions: [...this.state.allTransactions, doc.data()],

      })
    })
    console.log(this.state.allTransactions);
  }
  searchTransactions = async (text1) => {
   
    var enteredText = text1.toUpperCase()
    if (enteredtext[0].toUpperCase() === 'B') {
      const t = await db
        .collection('transaction')
        .where('bookId', '==', text1)
        .limit(10)
        .get();

      t.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    }

    else if (enteredtext[0].toUpperCase() === 'S') {
      const t = await db
        .collection('transaction')
        .where('studentId', '==', text1)
        .get();
      t.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    }




    ;
  }
  render() {
    return (
      <SafeAreaProvider>

        <View style={styles.container}>
          <View style={styles.searchBar}>
            <TextInput style={styles.bar} placeholder="Enter Book or Student ID"
              onChangeText={(text) => {
                this.setState({
                  search: text
                })
              }}
            />
            <TouchableOpacity style={styles.searchButton} onPress={() => this.searchTransactions(this.state.search)}>
              <Text>Search</Text>
            </TouchableOpacity>




          </View>
          <FlatList
            data={this.state.allTransactions}
            renderItem={({ item }) => (
              <View style={{ borderWidth: 2, borderColor: 'coral', padding: 12, margin: 10 }}>
                <Text> {"Book Id : " + item.bookId}</Text>
                <Text> {"Student Id : " + item.studentId}</Text>
                <Text> {"Transaction Type : " + item.transactionType}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            onEndReached={this.fetchMoreTransactions}
            onEndReachedThreshold={0.7} />
          {/* <ScrollView>
          {this.state.allTransactions.map((transaction, index) => {
            return (
              <View key={index} style={{ borderWidth: 2, borderColor: 'coral', padding: 12, margin: 10 }}>
                <Text> {"Book Id : " + transaction.bookId}</Text>
                <Text> {"Student Id : " + transaction.studentId}</Text>
                <Text> {"Transaction Type : " + transaction.transactionType}</Text>
                <Text> {"Date : " + transaction.date.toDate()}</Text>
              </View>
            )
          })
          }
        </ScrollView> */}


          <Text>
            Search Screen
          </Text>
        </View>

      </SafeAreaProvider>
    )




  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    height: 40,
    width: 'auto',
    borderWidth: 0.5,
    alignItems: 'center',
    backgroundColor: '#ffe2e2',
  },
  bar: {
    borderWidth: 2,
    height: 30,
    width: 300,
    paddingLeft: 10,
  },
  searchButton: {
    borderWidth: 1,
    height: 30,
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14ffec',
    padding: 10,
    borderRadius: 8,
    margin: 10,
  },
});