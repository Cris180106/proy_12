const colors = require('colors');
const fs = require('fs').promises;

const cargarProductosDesdeArchivo = (productostienda) => {
    const nombrearchivo = './datos.json';

    return fs.readFile(nombrearchivo, 'utf-8')
        .then((data) => {
            productostienda.listaproductos = JSON.parse(data);
            console.log('Productos cargados desde datos.json'.bgBlue);
        })
        .catch((error) => {
            console.error(`Error al cargar el archivo: ${error.message}`.bgRed);
        });
};

const getFechaHora = () => {
    const ahora = new Date();
    const fechaHora = `${ahora.getFullYear()}_${ahora.getMonth() + 1}_${ahora.getDate()}_${ahora.getHours()}_${ahora.getMinutes()}_${ahora.getSeconds()}`;
    return fechaHora;
};

const agregarProducto = (productostienda, nuevoProducto) => {
    productostienda.listaproductos.push(nuevoProducto);
    console.log('Producto agregado:'.bgGreen);
    console.log(nuevoProducto);

    const nombrearchivo = './datos.json';
    const cadenaJson = JSON.stringify(productostienda.listaproductos);

    return fs.writeFile(nombrearchivo, cadenaJson, 'utf-8')
        .then(() => {
            console.log(`DATOS GUARDADOS EN ${nombrearchivo}`.bgBlue);
        })
        .catch((error) => {
            console.error(`Error al guardar el archivo: ${error.message}`.bgRed);
        });
};

const realizarCopiaSeguridad = async (productostienda) => {
    console.log('Realizando copia de seguridad'); 
    const nombrearchivoCopia = `./copia_datos_${getFechaHora()}.json`;
    const cadenaJson = JSON.stringify(productostienda.listaproductos);

    try {
        await fs.writeFile(nombrearchivoCopia, cadenaJson, 'utf-8');
        console.log(`Copia de seguridad de datos realizada en ${nombrearchivoCopia}`.bgBlue);

        const continuar = await nuevaOperacion('¿Desea realizar otra copia de seguridad? (si/no)');
        if (continuar.toLowerCase() === 'si') {
            await realizarCopiaSeguridad(productostienda);
        }
    } catch (error) {
        console.error(`Error al realizar la copia de seguridad: ${error.message}`.bgRed);
    }
};


module.exports = {
    cargarProductosDesdeArchivo,
    agregarProducto,
    realizarCopiaSeguridad
};