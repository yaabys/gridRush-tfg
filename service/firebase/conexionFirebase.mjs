import { initializeApp } from "firebase/app"
import bcrypt from "bcrypt"
import { getFirestore, collection, doc, getDoc,getDocs, setDoc, query,where} from "firebase/firestore"
import { hashearPassword } from "../controllers/userController.mjs"
import { deleteDoc } from 'firebase/firestore'; // Asegúrate de importar esto

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
    // dependiendo si es email o username
    const campo = username.includes("@") ? "email" : "username";
    const valor = username.toLowerCase();

    const q = query(collection(db, "gridrush_fb"), where(campo, "==", valor));
    const result = await getDocs(q);

    if (result.empty) {
      return null;
    }

    const userDoc = result.docs[0];
    const userData = userDoc.data();

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return null;
    }

    return userData;
  } catch (error) {
    console.error("Error en comprobarLogin:", error);
    return null;
  }
};

export const actualizarFirebase = async (usernameActual, usernameNuevo, emailNuevo) => {
  try {
    const emailLower = emailNuevo.toLowerCase();
    const usernameLower = usernameNuevo.toLowerCase();
    const usernameActualLower = usernameActual.toLowerCase();

    const emailDocRef = doc(collection(db, "gridrush_fb"), emailLower);
    const usernameDocRef = doc(collection(db, "gridrush_fb"), usernameLower);
    const usernameActualDocRef = doc(collection(db, "gridrush_fb"), usernameActualLower);

    const userDoc = await getDoc(usernameActualDocRef);
    if (!userDoc.exists()) {
      return { success: false, error: "Usuario no encontrado en Firebase." };
    }
    const userData = userDoc.data();
    const emailActualLower = userData.email.toLowerCase();

    if (usernameLower !== usernameActualLower) {
      const usernameDoc = await getDoc(usernameDocRef);
      if (usernameDoc.exists()) {
        return { success: false, error: "El nombre de usuario ya está registrado." };
      }
    }
    if (emailLower !== emailActualLower) {
      const emailDoc = await getDoc(emailDocRef);
      if (emailDoc.exists()) {
        return { success: false, error: "El correo ya está registrado." };
      }
    }

    const nuevosDatos = {
      ...userData,
      username: usernameNuevo,
      email: emailLower
    };

    await setDoc(emailDocRef, nuevosDatos);
    await setDoc(usernameDocRef, nuevosDatos);

    if (usernameLower !== usernameActualLower) {
      await deleteDoc(usernameActualDocRef); // 👈 BORRAR, no vaciar
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
