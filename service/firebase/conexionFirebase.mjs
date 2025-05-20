import { initializeApp } from "firebase/app"
import bcrypt from "bcrypt"
import { getFirestore, collection, doc, getDoc,getDocs, setDoc, query,where} from "firebase/firestore"
import { hashearPassword } from "../controllers/userController.mjs"
import { deleteDoc } from 'firebase/firestore'; 
import { conn } from "../sql/conexionSQL.mjs";

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.SENDER_ID,
    appId: process.env.APP_ID
}
  
const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)

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

export const actualizarUsernameFirebase = async (usernameActual, usernameNuevo) => {
  try {
    const usernameLower = usernameNuevo.toLowerCase();
    const usernameActualLower = usernameActual.toLowerCase();

    const usernameDocRef = doc(collection(db, "gridrush_fb"), usernameLower);

    // Comprobar si el nuevo username ya existe
    const usernameDoc = await getDoc(usernameDocRef);
    if (usernameDoc.exists()) {
      return { success: false, error: "El nombre de usuario ya está registrado." };
    }

    // Buscar el usuario actual en Firebase
    const q = query(collection(db, "gridrush_fb"), where("username", "==", usernameActual));
    const result = await getDocs(q);

    if (result.empty) {
      return { success: false, error: "Usuario no encontrado en Firebase." };
    }

    const userDoc = result.docs[0];
    const userData = userDoc.data();

    const nuevosDatos = {
      ...userData,
      username: usernameNuevo,
    };

    // Guardar en el nuevo documento en Firebase
    await setDoc(usernameDocRef, nuevosDatos);

    // Eliminar el documento antiguo en Firebase
    await deleteDoc(doc(collection(db, "gridrush_fb"), userDoc.id));

    // Actualizar en SQL
    const resultadoSQL = await conn.execute({
      sql: "UPDATE Usuarios SET username = ? WHERE username = ?",
      args: [usernameNuevo, usernameActual]
    });

    if (resultadoSQL.affectedRows === 0) {
      return { success: false, error: "No se pudo actualizar el nombre de usuario en SQL." };
    }

    return { success: true };
  } catch (error) {
    console.error("Error en actualizarUsernameFirebase:", error);
    return { success: false, error: error.message };
  }
};

export const actualizarEmailFirebase = async (usernameActual, emailNuevo) => {
  try {
    const emailLower = emailNuevo.toLowerCase();

    const emailDocRef = doc(collection(db, "gridrush_fb"), emailLower);

    // Comprobar si el nuevo email ya existe
    const emailDoc = await getDoc(emailDocRef);
    if (emailDoc.exists()) {
      return { success: false, error: "El correo ya está registrado." };
    }

    // Buscar el usuario actual en Firebase
    const q = query(collection(db, "gridrush_fb"), where("username", "==", usernameActual));
    const result = await getDocs(q);

    if (result.empty) {
      return { success: false, error: "Usuario no encontrado en Firebase." };
    }

    const userDoc = result.docs[0];
    const userData = userDoc.data();

    const nuevosDatos = {
      ...userData,
      email: emailLower,
    };

    // Guardar en el nuevo documento en Firebase
    await setDoc(emailDocRef, nuevosDatos);

    // Eliminar el documento antiguo en Firebase
    await deleteDoc(doc(collection(db, "gridrush_fb"), userDoc.id));

    // Actualizar en SQL
    const resultadoSQL = await conn.execute({
      sql: "UPDATE Usuarios SET email = ? WHERE username = ?",
      args: [emailNuevo, usernameActual]
    });

    if (resultadoSQL.affectedRows === 0) {
      return { success: false, error: "No se pudo actualizar el correo electrónico en SQL." };
    }

    return { success: true };
  } catch (error) {
    console.error("Error en actualizarEmailFirebase:", error);
    return { success: false, error: error.message };
  }
};
