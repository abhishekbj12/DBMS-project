function initLogin() {
	console.log("log");
	document.querySelector(".access").classList.add("access--hidden");
	document.querySelector(".accessForm").classList.remove("accessForm--hidden");
}

function initSignup() {
	console.log("sign");
	document.querySelector(".access").classList.add("access--hidden");
	document.querySelector(".accessForm").classList.remove("accessForm--hidden");
}

function closeAccessForm() {
	document.querySelector(".access").classList.remove("access--hidden");
	document.querySelector(".accessForm").classList.add("accessForm--hidden");
}

document.querySelector(".access__login").addEventListener("click", initLogin);
// document.querySelector(".access__signup").addEventListener("click", initSignup);
document.querySelector(".accessForm__cancel").addEventListener("click", closeAccessForm);
