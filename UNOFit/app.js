/*
UNOFit — Sistema interno para gimnasios
Dirección General y Propietario: Hugo González Nápoles
© 2026 UNOFit. Todos los derechos reservados.
*//* ==================================================
   UTILIDADES
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
   USUARIOS (LOGIN)
================================================== */
let USUARIOS = JSON.parse(localStorage.getItem("UNOFit_usuarios")) || [
  { celular:"6867363304", nip:"1234", rol:"GT", nombre:"Propietario" },
  { celular:"5511111111", nip:"1234", rol:"EV", nombre:"Ventas" },
  { celular:"5522222222", nip:"1234", rol:"EP", nombre:"Entrenador" },
  { celular:"5533333333", nip:"1234", rol:"AN", nombre:"Anfitrión" }
];

function guardarUsuarios(){
  localStorage.setItem("UNOFit_usuarios", JSON.stringify(USUARIOS));
}

/* ==================================================
   SOCIOS (CON FOTO)
================================================== */
const SOCIOS = [
  {
    clave:"U0F1",
    nombre:"Juan",
    apellido:"Pérez",
    celular:"5510000001",
    estado:"Activo",
    cat:"CAT ACEPTADO",
    foto:"https://i.pravatar.cc/150?img=12"
  },
  {
    clave:"U0F2",
    nombre:"Ana",
    apellido:"López",
    celular:"5510000002",
    estado:"No activo",
    cat:"CAT DECLINADO",
    foto:"https://i.pravatar.cc/150?img=32"
  }
];

/* ==================================================
   LOGIN
================================================== */
function loginVista(){
  ocultarBuscador();
  render(`
    <div class="card">
      <h3>Inicia sesión</h3>
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
  if(!u){ alert("Datos incorrectos"); return; }
  guardarSesion(u);
  homePorRol(u);
}

/* ==================================================
   BARRA SUPERIOR
================================================== */
function mostrarBuscador(){ const q=$("#q"); if(q) q.style.display="block"; }
function ocultarBuscador(){ const q=$("#q"); if(q) q.style.display="none"; }
function limpiarBuscador(){ const q=$("#q"); if(q) q.value=""; }

/* ==================================================
   HOME POR ROL
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
   BUSCADOR
================================================== */
const buscador = $("#q");
if(buscador){
  buscador.addEventListener("input", e=>{
    const v = e.target.value.trim().toUpperCase();
    if(!v){ homePorRol(obtenerSesion()); return; }
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
  render(lista.map(cardSocio).join(""));
}

/* ==================================================
   VISTAS
================================================== */
function vistaGT(u){
  render(`
    <div class="card">
      <strong>Propietario</strong><br>${u.nombre}
      <button onclick="formAgregarUsuario()">➕ Agregar usuario</button>
      <button onclick="cerrarSesion()">Cerrar sesión</button>
    </div>
    ${SOCIOS.map(cardSocio).join("")}
  `);
}

function vistaEV(u){
  render(`<div class="card"><strong>Ventas</strong><br>${u.nombre}
    <button onclick="cerrarSesion()">Cerrar sesión</button></div>
    ${SOCIOS.map(cardSocio).join("")}`);
}

function vistaEP(u){
  render(`<div class="card"><strong>Entrenador</strong><br>${u.nombre}
    <button onclick="cerrarSesion()">Cerrar sesión</button></div>
    ${SOCIOS.map(cardSocio).join("")}`);
}

function vistaAN(u){
  render(`<div class="card"><strong>Anfitrión</strong><br>${u.nombre}
    <button onclick="cerrarSesion()">Cerrar sesión</button></div>
    ${SOCIOS.map(cardSocio).join("")}`);
}

/* ==================================================
   AGREGAR USUARIO (SOLO GT)
================================================== */
function formAgregarUsuario(){
  render(`
    <div class="card">
      <h3>Agregar usuario</h3>
      <input id="nNombre" placeholder="Nombre">
      <input id="nCel" placeholder="Celular">
      <select id="nRol">
        <option value="GT">Gerente</option>
        <option value="EV">Ventas</option>
        <option value="EP">Entrenador</option>
        <option value="AN">Anfitrión</option>
      </select>
      <button onclick="guardarNuevoUsuario()">Guardar</button>
      <button onclick="homePorRol(obtenerSesion())">Cancelar</button>
    </div>
  `);
}

function guardarNuevoUsuario(){
  const u={
    nombre:$("#nNombre").value,
    celular:$("#nCel").value,
    nip:"1234",
    rol:$("#nRol").value
  };
  if(!u.nombre||!u.celular){ alert("Datos incompletos"); return; }
  USUARIOS.push(u);
  guardarUsuarios();
  alert("Usuario agregado");
  homePorRol(obtenerSesion());
}

/* ==================================================
   CARD SOCIO
================================================== */
function cardSocio(s){
  return `
  <div class="card">
    <img src="${s.foto}" style="width:72px;border-radius:50%">
    <strong>${s.nombre} ${s.apellido}</strong><br>
    Clave: ${s.clave}<br>
    Estado: ${s.estado}<br>
    CAT: ${s.cat}
    <div class="acciones">
      <button onclick="wa('${s.celular}')">💬 WhatsApp</button>
    </div>
  </div>`;
}

function wa(cel){
  window.open(`https://wa.me/52${cel}`);
}

/* ==================================================
   INIT
================================================== */
const sesion = obtenerSesion();
sesion ? homePorRol(sesion) : loginVista();

/* ==================================================
   SERVICE WORKER
================================================== */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

