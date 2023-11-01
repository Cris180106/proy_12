const colors = require('colors');
const fs = require('fs').promises;
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

class Producto {
    constructor(codigo = '', nombre = '', inventario = 0, precio = 0) {
        this.codigoproducto = codigo;
        this.nombreproducto = nombre;
        this.inventarioproducto = inventario;
        this.precioproducto = precio;
    }
}

class ProductosTienda {
    constructor() {
        this.listaproductos = [];
    }

    mostrarProductos() {
        this.listaproductos.forEach((producto) => {
            console.log(
                '╟━━━━━━━━━━━━━━╢', 
                `Código: ${producto.codigoproducto}`.cyan,
                `Nombre: ${producto.nombreproducto}`.cyan,
                `Inventario: ${producto.inventarioproducto}`.cyan,
                `Precio: ${producto.precioproducto}`.cyan,
                '╢'
            );
        });
    }

    eliminarProducto(codigo) {
        this.listaproductos = this.listaproductos.filter(producto => producto.codigoproducto !== codigo);
    }
}

const cargarProductosDesdeArchivo = async (productostienda) => {
    const nombrearchivo = './datos.json';

    fs.readFile(nombrearchivo, 'utf-8')
        .then((data) => {
            productostienda.listaproductos = JSON.parse(data);
            console.log('Productos cargados desde datos.json'.bgBlue);
        })
        .catch((error) => {
            console.error(`Error al cargar el archivo: ${error.message}`.bgRed);
        });
};

const agregarProducto = async (productostienda, nuevoProducto) => {
    productostienda.listaproductos.push(nuevoProducto);
    console.log('Producto agregado:'.bgGreen);
    console.log(nuevoProducto);

    const nombrearchivo = './datos.json';
    const cadenaJson = JSON.stringify(productostienda.listaproductos);

    fs.writeFile(nombrearchivo, cadenaJson, 'utf-8')
        .then(() => {
            console.log(`DATOS GUARDADOS EN ${nombrearchivo}`.bgBlue);
        })
        .catch((error) => {
            console.error(`Error al guardar el archivo: ${error.message}`.bgRed);
        });
};

const mostrarMenu = () => {
    return new Promise((resolve) => {
        console.log('1'.magenta, 'Agregar un nuevo producto');
        console.log('2'.magenta, 'Lista de productos');
        console.log('3'.magenta, 'Borrar un producto');
        console.log('4'.magenta, 'Finalizar programa\n');

        readline.question('Opción: ', (opt) => {
            resolve(opt);
        });
    });
};

const pausa = () => {
    return new Promise((resolve) => {
        readline.question(`\nPresiona ${'ENTER'.cyan} para continuar\n`, (opt) => {
            resolve();
        });
    });
};

const obtenerDetallesProducto = async () => {
    return new Promise((resolve) => {
        const nuevoProducto = new Producto();

        readline.question('Código del producto: ', (codigo) => {
            nuevoProducto.codigoproducto = codigo;
            readline.question('Nombre del producto: ', (nombre) => {
                nuevoProducto.nombreproducto = nombre;
                readline.question('Inventario del producto: ', (inventario) => {
                    nuevoProducto.inventarioproducto = parseInt(inventario);
                    readline.question('Precio del producto: ', (precio) => {
                        nuevoProducto.precioproducto = parseFloat(precio);
                        resolve(nuevoProducto);
                    });
                });
            });
        });
    });
};

const main = async () => {
    console.clear();
    let productostienda = new ProductosTienda();
    await cargarProductosDesdeArchivo(productostienda);

    let opcion;

    do {
        opcion = await mostrarMenu();

        switch (opcion) {
            case '1':
                console.clear();
                console.log('=== AGREGAR NUEVO PRODUCTO ==='.cyan);
                const nuevoProducto = await obtenerDetallesProducto();
                await agregarProducto(productostienda, nuevoProducto);
                await pausa();
                break;

            case '2':
                console.clear();
                console.log('=== LISTA DE PRODUCTOS ==='.cyan);
                productostienda.mostrarProductos();
                await pausa();
                break;


case '3':
    console.clear();
    console.log('=== BORRAR PRODUCTO ==='.cyan);
    console.log('=== SELECCIONE EL PRODUCTO ==='.cyan);
    productostienda.mostrarProductos();

    readline.question('Ingrese el código del producto a eliminar (o "0" para cancelar): ', async (codigo) => {
        if (codigo === '0') {
            console.log('Cancelando eliminación, ningún producto se ha eliminado.'.bgYellow);
        } else {
            const productoAEliminar = productostienda.listaproductos.find(producto => producto.codigoproducto === codigo);

            if (productoAEliminar) {
                productostienda.eliminarProducto(codigo);
                const nombrearchivo = './datos.json';
                const cadenaJson = JSON.stringify(productostienda.listaproductos);

                await fs.writeFile(nombrearchivo, cadenaJson, 'utf-8')
                    .then(() => {
                        console.log(`Producto con código ${codigo} eliminado y datos guardados en ${nombrearchivo}`.bgBlue);
                    })
                    .catch((error) => {
                        console.error(`Error al guardar el archivo: ${error.message}`.bgRed);
                    });
            } else {
                console.log(`No se encontró ningún producto con el código ${codigo}`.bgRed);
            }
        }

        await pausa();
    });
    break;


            case '4':
                console.log('=== PROGRAMA FINALIZADO ==='.bgMagenta);
                break;

            default:
                console.log('Opción no válida. Por favor, elige una opción válida.'.bgRed);
                await pausa();
                break;
        }
    } while (opcion !== '4');

    readline.close();
};

main();