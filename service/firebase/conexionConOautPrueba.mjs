// /* Para hacer el OAuth con Google se necesita firebase/auth*/
// import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// import { initializeApp } from "firebase/app"
// import bcrypt from "bcrypt"
// import { getFirestore, collection, doc, getDoc, setDoc} from "firebase/firestore"

// const firebaseConfig = {
//     apiKey: process.env.API_KEY,
//     authDomain: process.env.AUTH_DOMAIN,
//     projectId: process.env.PROJECT_ID,
//     storageBucket: process.env.STORAGE_BUCKET,
//     messagingSenderId: process.env.SENDER_ID,
//     appId: process.env.APP_ID
// }
  
// const firebaseApp = initializeApp(firebaseConfig)
// export const db = getFirestore(firebaseApp)//coge referencia a la base de datos (coleccion)

// const auth = getAuth();
// const provider = new GoogleAuthProvider();

// export const signInWithGoogle = async () => {
//   try {
//     const result = await signInWithPopup(auth, provider);
//     const user = result.user; //para coger todo el usuario
//     const email = user.email.toLowerCase();
//     const uid = user.uid;

//     const emailDocRef = doc(collection(db, "gridrush_fb"), emailLower);
//     const usernameDocRef = doc(collection(db, "gridrush_fb"), email.split("@")[0]);

//     const emailDoc = await getDoc(emailDocRef);
//     const usernameDoc = await getDoc(usernameDocRef);

//     if (emailDoc.exists()) {
//       console.error("El correo ya está registrado");
//       return { success: false, error: "El correo ya está registrado" };
//     } else if(usernameDoc.exists()) {
//       console.error("El nombre de usuario ya está registrado");
//       return { success: false, error: "El nombre de usuario ya está registrado" };
//     }

//     // Crear un nuevo usuario si no existe
//     const colection = doc(collection(db, "gridrush_fb"), uid);
//     const newUser = {
//       email: email,
//       username: email.split("@")[0], // Quita el @gmail.com y se queda con el nombre de usuario
//     };
//     await setDoc(colection, newUser);

//     return { success: true, uid: user.uid };
//   } catch (error) {
//     console.error("Error en login con Google:", error);
//     return { success: false, error: error.message };
//   }
// };

// export const registrar = async (email, hashedPassword, username) => {
//   try {
//     const emailLower = email.toLowerCase();

//     // Verificar si el correo o el nombre de usuario ya están registrados
//     const emailDocRef = doc(collection(db, "gridrush_fb"), emailLower);
//     const usernameDocRef = doc(collection(db, "gridrush_fb"), username.toLowerCase());

//     const emailDoc = await getDoc(emailDocRef);
//     const usernameDoc = await getDoc(usernameDocRef);

//     if (emailDoc.exists()) {
//       console.error("El correo ya está registrado.");
//       return { success: false, error: "El correo ya está registrado." };
//     }

//     if (usernameDoc.exists()) {
//       console.error("El nombre de usuario ya está registrado.");
//       return { success: false, error: "El nombre de usuario ya está registrado." };
//     }

//     // Registrar el nuevo usuario
//     const newUser = {
//       username: username,
//       email: emailLower,
//       password: hashedPassword,
//     };

//     await setDoc(emailDocRef, newUser);
//     console.log("Usuario registrado correctamente");
//     return { success: true };
//   } catch (error) {
//     console.error("Error en registrar:", error);
//     return { success: false, error: error.message };
//   }
// };

// export const comprobarLogin = async (email,password) => {
//   try {
//     const docRef = doc(db, "usuarios_f1", email.toLowerCase())
//     const userDoc = await getDoc(docRef)

//     if (!userDoc.exists()) {
//         return null
//     }

//     const userData = userDoc.data()
//     const hashedPassword = userData.password

//     const isMatch = await bcrypt.compare(password, hashedPassword)

//     if (!isMatch) {
//         return null
//     }

//     return userData
// } catch (error) {
//     console.error("Error en comprobarLogin:", error)
//     return null
// }
// }