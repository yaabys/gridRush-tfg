import { initializeApp } from "firebase/app"
import bcrypt from "bcrypt"
import { getFirestore, collection, doc, getDoc, setDoc} from "firebase/firestore"
import { hashearPassword } from "../controllers/userController.mjs"

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.SENDER_ID,
    appId: process.env.APP_ID
}
  
const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)//coge referencia a la base de datos (coleccion)

export const registrarFirebase = async (email, hashedPassword, username) => {
  try {

    if(username.includes("@")) {
      console.error("El nombre de usuario no puede contener '@'.");
      return { success: false, error: "El nombre de usuario no puede contener '@'." };
    }

    const emailLower = email.toLowerCase();
    const usernameLower = username.toLowerCase();

    const emailDocRef = doc(collection(db, "gridrush_fb"), emailLower);
    const usernameDocRef = doc(collection(db, "gridrush_fb"), usernameLower);

    const emailDoc = await getDoc(emailDocRef);
    const usernameDoc = await getDoc(usernameDocRef);

    if (emailDoc.exists()) {
      console.error("El correo ya está registrado.");
      return { success: false, error: "El correo ya está registrado." };
    }

    if (usernameDoc.exists()) {
      console.error("El nombre de usuario ya está registrado.");
      return { success: false, error: "El nombre de usuario ya está registrado." };
    }

    const newUser = {
      username: username,
      email: emailLower,
      password: hashedPassword,
    };

    await setDoc(emailDocRef, newUser);
    return { success: true };
  } catch (error) {
    console.error("Error en registrar:", error);
    return { success: false, error: error.message };
  }
};

export const comprobarLogin = async (username, password) => {
  try {
    let docRef;

    if (username.includes("@")) { //si es email
      const emailLower = username.toLowerCase();
      docRef = doc(collection(db, "gridrush_fb"), emailLower);
    } else { //si es username
      const usernameLower = username.toLowerCase();
      docRef = doc(collection(db, "gridrush_fb"), usernameLower);
    }

    const userDoc = await getDoc(docRef);

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    const hashedPassword = userData.password;

    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      return null;
    }

    return userData;
  } catch (error) {
    console.error("Error en comprobarLogin:", error);
    return null;
  }
};