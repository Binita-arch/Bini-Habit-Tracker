import { auth } from "./firebase.js";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const provider = new GoogleAuthProvider();
const signInBtn = document.getElementById("googleSignIn");

function signIn() {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Sign")
            const user = result.user;
            localStorage.setItem("email", JSON.stringify(user.email));
            window.location.href = "main.html";
        })
        .catch((error) => {
            console.error(error);
        })
}

signInBtn.addEventListener("click", function(event) {
    signIn();
});