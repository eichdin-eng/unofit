/* ==================================================
   UTILIDADES BÁSICAS
================================================== */
const $ = sel => document.querySelector(sel);
const render = html => { $("#app").innerHTML = html; };

/* ==================================================
   SESIÓN
================================================== */
function guardarSesion(u){
  localStorage.setItem("UNOFit_sesion", JSON.stringify(u));
}
function obtenerSesion(){
  const s = localStorage.getItem("UNOFit_sesion");
  return s ? JSON.parse(s) : null;
}
function cerrarSesion(){
  localStorage.removeItem("UNOFit_sesion");
  ocultarBuscador();
  location.reload();
}

/* ==================================================
   DATOS BASE (DEMO)
================================================== */
const USUARIOS = [
  { celular:"5511111111", nip:"1234", rol:"GT", nombre:"Gerente" },
  { celular:"5522222222", nip:"1234", rol:"EV", nombre:"Ventas" },
  { celular:"5533333333", nip:"1234", rol:"EP", nombre:"Entrenador" },
  { celular:"5544444444", nip:"1234", rol:"AN", nombre:"Anfitrión" }
];

const SOCIOS = [
  {
    clave:"U0F1",
    nombre:"Juan",
    apellido:"Pérez",
    celular:"5510000001",
    estado:"Activo",
    cat:"CAT ACEPTADO",
    documentos:{ ine:true, admision:true }
  },
  {
    clave:"U0F2",
    nombre:"Ana",
    apellido:"López",
    celular:"5510000002",
    estado:"No activo",
    cat:"CAT DECLINADO",
    documentos:{ ine:true, admision:true }
  }
];

/* ==================================================
   LOGIN
================================================== */
function loginVista(){
  ocultarBuscador();
  render(`
    <div class="card">
      <h3>Acceso UNOFit</h3>
      <input id="cel" placeholder="Celular">
      <input id="nip" type="password" placeholder="NIP">
      <button onclick="login()">Entrar</button>
    </div>
  `);
}

function login(){
  const cel = $("#cel").value;
  const nip = $("#nip").value;
  const u = USUARIOS.find(x => x.celular === cel && x.nip === nip);
  if(!u){
    alert("Datos incorrectos");
    return;
  }
  guardarSesion(u);
  homePorRol(u);
}

/* ==================================================
   BARRA SUPERIOR
================================================== */
function mostrarBuscador(){
  const q = $("#q");
  if(q) q.style.display = "block";
}
function ocultarBuscador(){
  const q = $("#q");
  if(q) q.style.display = "none";
}
function limpiarBuscador(){
  const q = $("#q");
  if(q) q.value = "";
}

/* ==================================================
   ENRUTADOR POR ROL
================================================== */
function homePorRol(u){
  mostrarBuscador();
  limpiarBuscador();
  if(u.rol==="GT") vistaGT(u);
  if(u.rol==="EV") vistaEV(u);
  if(u.rol==="EP") vistaEP(u);
  if(u.rol==="AN") vistaAN(u);
}

/* ==================================================
   BUSCADOR (CLAVE / CELULAR / APELLIDO)
================================================== */
const buscador = $("#q");
if(buscador){
  buscador.addEventListener("input", e=>{
    const v = e.target.value.trim().toUpperCase();
    if(!v) return;

    const res = SOCIOS.filter(s =>
      s.clave === v ||
      s.celular === v ||
      s.apellido.toUpperCase().includes(v)
    );
    renderResultados(res);
  });
}

function renderResultados(lista){
  if(!lista.length){
    render("<div class='card'>Sin resultados</div>");
    return;
  }
  render(lista.map(s=>cardSocio(s)).join(""));
}

/* ==================================================
   VISTAS POR ROL
================================================== */
function vistaGT(u){
  render(`
    <div class="card">
      <strong>Gerente</strong><br>${u.nombre}
      <button onclick="cerrarSesion()">Cerrar sesión</button>
    </div>
    ${SOCIOS.map(cardSocio).join("")}
  `);
}

function vistaEV(u){
  render(`
    <div class="card">
      <strong>Ventas</strong><br>${u.nombre}
      <button onclick="cerrarSesion()">Cerrar sesión</button>
    </div>
    ${SOCIOS.map(cardSocio).join("")}
  `);
}

function vistaEP(u){
  render(`
    <div class="card">
      <strong>Entrenador</strong><br>${u.nombre}
      <button onclick="cerrarSesion()">Cerrar sesión</button>
    </div>
    ${SOCIOS.map(cardSocio).join("")}
  `);
}

function vistaAN(u){
  render(`
    <div class="card">
      <strong>Anfitrión</strong><br>${u.nombre}
      <button onclick="cerrarSesion()">Cerrar sesión</button>
    </div>
    ${SOCIOS.map(cardSocio).join("")}
  `);
}

/* ==================================================
   PERFIL SOCIO
================================================== */
function cardSocio(s){
  return `
  <div class="card">
    <strong>${s.nombre} ${s.apellido}</strong><br>
    Clave: ${s.clave}<br>
    Estado: ${s.estado}<br>
    CAT: ${s.cat}

    <div class="acciones">
      ${btnWhatsApp("CAT",s)}
      ${btnCorreo("CAT",s)}
      ${btnDescargar("CAT",s)}
    </div>

    <div class="acciones">
      ${btnWhatsApp("INE",s)}
      ${btnCorreo("INE",s)}
      ${btnDescargar("INE",s)}
    </div>

    <div class="acciones">
      ${btnWhatsApp("ADMISION",s)}
      ${btnCorreo("ADMISION",s)}
      ${btnDescargar("ADMISION",s)}
    </div>
  </div>`;
}

/* ==================================================
   BOTONES DOCUMENTOS
================================================== */
function puedeDescargar(){
  const s = obtenerSesion();
  return s && (s.rol==="GT" || s.rol==="AN");
}

function btnWhatsApp(tipo,s){
  return `<button onclick="enviarWhatsApp('${tipo}','${s.celular}')">💬</button>`;
}
function btnCorreo(tipo,s){
  return `<button onclick="enviarCorreo('${tipo}','${s.celular}')">✉️</button>`;
}
function btnDescargar(tipo,s){
  if(!puedeDescargar()) return "";
  return `<button onclick="descargarDoc('${tipo}','${s.celular}')">⬇️</button>`;
}

/* ==================================================
   ACCIONES DOCUMENTOS
================================================== */
function enviarWhatsApp(tipo,cel){
  const msg = `Te comparto tu ${tipo} UNOFit.`;
  window.open(`https://wa.me/52${cel}?text=${encodeURIComponent(msg)}`);
}

function enviarCorreo(tipo,cel){
  alert(`Correo enviado con ${tipo} a ${cel}`);
}

function descargarDoc(tipo,cel){
  alert(`Descargando ${tipo} para auditoría (${cel})`);
}

/* ==================================================
   INICIO
================================================== */
const sesion = obtenerSesion();
sesion ? homePorRol(sesion) : loginVista();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(() => console.log("Service Worker UNOFit activo"))
      .catch(err => console.error("SW error", err));
  });
}

/* ==================================================
   ESTADO DE CONEXIÓN
================================================== */
function mostrarEstadoConexion(){
  const offlineMsg = document.createElement("div");
  offlineMsg.id = "offlineMsg";
  offlineMsg.style.position = "fixed";
  offlineMsg.style.bottom = "16px";
  offlineMsg.style.left = "50%";
  offlineMsg.style.transform = "translateX(-50%)";
  offlineMsg.style.background = "#111";
  offlineMsg.style.color = "#fff";
  offlineMsg.style.padding = "10px 16px";
  offlineMsg.style.borderRadius = "999px";
  offlineMsg.style.fontSize = "13px";
  offlineMsg.style.zIndex = "999";
  offlineMsg.style.display = "none";
  offlineMsg.innerText = "Sin conexión. Algunas funciones están limitadas.";

  document.body.appendChild(offlineMsg);

  function actualizar(){
    offlineMsg.style.display = navigator.onLine ? "none" : "block";
  }

  window.addEventListener("online", actualizar);
  window.addEventListener("offline", actualizar);
  actualizar();
}

window.addEventListener("load", mostrarEstadoConexion);