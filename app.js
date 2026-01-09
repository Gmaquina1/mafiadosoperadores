// ano automático
document.getElementById("year").textContent = new Date().getFullYear();

// WhatsApp
document.querySelectorAll(".wa").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const msg = encodeURIComponent(btn.dataset.msg);
    window.open(`https://wa.me/55SEUNUMEROAQUI?text=${msg}`,"_blank");
  });
});
