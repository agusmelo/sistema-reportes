const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mmayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']


const fecha = new Date()
const mes = MESES[fecha.getMonth()]

console.log(fecha.getDate())