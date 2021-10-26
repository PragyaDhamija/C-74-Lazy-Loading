import firebase from 'firebase';
require('@firebase/firestore')
//require('@firebase/firestore')

const firebaseConfig = {
    apiKey: "AIzaSyDUG0Z01_I8VlzWOTfAUik61zu-X-Rb7h4",
    authDomain: "e-library-ba8d7.firebaseapp.com",
    projectId: "e-library-ba8d7",
    storageBucket: "e-library-ba8d7.appspot.com",
    messagingSenderId: "178873287320",
    appId: "1:178873287320:web:7ddf3116f3c3d02a0806ed"
  };
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();