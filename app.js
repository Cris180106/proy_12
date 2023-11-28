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

class CarritoCompras {
    constructor() {
        this.ultimaFactura = null;
    }

    comprarProducto(producto, cantidad, comprador) {
        if (producto.inventarioproducto >= cantidad) {
            const total = cantidad * producto.precioproducto;
            this.ultimaFactura = {
                comprador,
                producto: {
                    nombre: producto.nombreproducto,
                    cantidad,
                    precioUnitario: producto.precioproducto,
                    total,
                },
            };

            console.log('=== FACTURA ==='.cyan);
            console.log(`Comprador: ${comprador.nombre}`.cyan);
            console.log(`ID o Cédula: ${comprador.id}`.cyan);
            console.log(`Correo Electrónico: ${comprador.correo}`.cyan);
            console.log(`Producto: ${producto.nombreproducto}`.cyan);
            console.log(`Cantidad: ${cantidad}`.cyan);
            console.log(`Precio Unitario: ${producto.precioproducto}`.cyan);
            console.log(`Total a Pagar: ${total}`.cyan);

            producto.inventarioproducto -= cantidad;
        } else {
            console.log(`No hay suficiente inventario para comprar ${cantidad} unidades de ${producto.nombreproducto}`.bgRed);
        }
    }

    generarFacturaGuardada() {
        if (this.ultimaFactura) {
            console.log('=== FACTURA GENERADA ==='.cyan);
            console.log(`Comprador: ${this.ultimaFactura.comprador.nombre}`.cyan);
            console.log(`ID o Cédula: ${this.ultimaFactura.comprador.id}`.cyan);
            console.log(`Correo Electrónico: ${this.ultimaFactura.comprador.correo}`.cyan);
            console.log(`Producto: ${this.ultimaFactura.producto.nombre}`.cyan);
            console.log(`Cantidad: ${this.ultimaFactura.producto.cantidad}`.cyan);
            console.log(`Precio Unitario: ${this.ultimaFactura.producto.precioUnitario}`.cyan);
            console.log(`Total a Pagar: ${this.ultimaFactura.producto.total}`.cyan);
        } else {
            console.log('No hay ninguna factura generada previamente.'.bgRed);
        }
    }
}

class CopiasSeguridad {
    static async gestionarCopiaSeguridad(productostienda) {
        console.clear();
        console.log('=== GESTIONAR COPIAS DE SEGURIDAD ==='.cyan);

        const subopcion = await nuevaOperacion('1. Realizar copia de seguridad\n2. Ver copias de seguridad\nIngrese la subopción');

        switch (subopcion) {
            case '1':
                await this.realizarCopia(productostienda);
                break;

            case '2':
                await this.verCopias(productostienda);
                break;

            default:
                console.log('Subopción no válida'.bgRed);
        }
    }

    static async verCopias(productostienda) {
        console.clear();
        console.log('=== LISTA DE COPIAS DE SEGURIDAD ==='.cyan);

        try {
            const files = await fs.readdir('./', 'utf-8');
            const copiasDeSeguridad = files.filter(file => /^copia_datos_\d+_\d+_\d+_\d+_\d+_\d+\.json$/i.test(file));

            if (copiasDeSeguridad.length > 0) {
                copiasDeSeguridad.forEach((copia, index) => {
                    console.log(`[${index + 1}] - ${copia}`.cyan);
                });

                const seleccion = await nuevaOperacion('Ingrese el número de la copia de seguridad para restaurar');
                const seleccionIndex = parseInt(seleccion) - 1;

                if (!isNaN(seleccionIndex) && seleccionIndex >= 0 && seleccionIndex < copiasDeSeguridad.length) {
                    const seleccionArchivo = `./${copiasDeSeguridad[seleccionIndex]}`;

                    const data = await fs.readFile(seleccionArchivo, 'utf-8');
                    productostienda.listaproductos = JSON.parse(data);
                    console.log(`Datos restaurados desde ${seleccionArchivo}`.bgBlue);
                } else {
                    console.log('Selección de copia de seguridad no válida'.bgRed);
                }
            } else {
                console.log('No hay copias de seguridad disponibles'.bgYellow);
            }
        } catch (error) {
            console.error(`Error al leer el directorio: ${error.message}`.bgRed);
        }

        await pausa();
    }

    static async realizarCopia(productostienda) {
        console.clear();
        console.log('=== REALIZAR COPIA DE SEGURIDAD ==='.cyan);

        const timestamp = new Date().getTime();
        const nombrearchivo = `./copia_datos_${timestamp}.json`;
        const cadenaJson = JSON.stringify(productostienda.listaproductos);

        try {
            await fs.writeFile(nombrearchivo, cadenaJson, 'utf-8');
            console.log(`Copia de seguridad realizada y guardada en ${nombrearchivo}`.bgBlue);
        } catch (error) {
            console.error(`Error al guardar la copia de seguridad: ${error.message}`.bgRed);
        }

        await pausa();
    }
}


await CopiasSeguridad.realizarCopia(productostienda);
await CopiasSeguridad.verCopias(productostienda);



class ProductosTienda {
    constructor() {
        this.listaproductos = [];
        this.carrito = new CarritoCompras();
    }

    async cargarProductosDesdeArchivo() {
        try {
            const data = await fs.readFile('./datos.json', 'utf-8');
            this.listaproductos = JSON.parse(data);
        } catch (error) {
            console.error(`Error al cargar productos desde el archivo: ${error.message}`.bgRed);
        }
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

    comprarProducto(codigo, cantidad, comprador) {
        const producto = this.listaproductos.find(producto => producto.codigoproducto === codigo);
        if (producto) {
            const carrito = new CarritoCompras();
            carrito.comprarProducto(producto, cantidad, comprador);
        } else {
            console.log(`No se encontró ningún producto con el código ${codigo}`.bgRed);
        }
    }
}

const mostrarMenu = () => {
    console.log('1'.magenta, 'Agregar un nuevo producto');
    console.log('2'.magenta, 'Lista de productos');
    console.log('3'.magenta, 'Borrar un producto');
    console.log('4'.magenta, 'Comprar producto');
    console.log('5'.magenta, 'Realizar copia de seguridad / Ver copias de seguridad');
    console.log('6'.magenta, 'Generar factura');
    console.log('7'.magenta, 'Finalizar programa\n');

    return new Promise((resolve) => {
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

const obtenerDetallesProducto = () => {
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

const obtenerDetallesComprador = () => {
    return new Promise((resolve) => {
        const comprador = {};

        readline.question('Nombre del comprador: ', (nombre) => {
            comprador.nombre = nombre;
            readline.question('ID o Cédula del comprador: ', (id) => {
                comprador.id = id;
                readline.question('Correo Electrónico del comprador: ', (correo) => {
                    comprador.correo = correo;
                    resolve(comprador);
                });
            });
        });
    });
};

const realizarCompra = async (productostienda) => {
    console.clear();
    console.log('=== COMPRAR PRODUCTO ==='.cyan);
    productostienda.mostrarProductos();

    return new Promise(async (resolve) => {
        const codigo = await obtenerCodigoProducto();
        const cantidad = await obtenerCantidadCompra();
        const comprador = await obtenerDetallesComprador();

        productostienda.carrito.comprarProducto(productostienda.listaproductos.find(p => p.codigoproducto === codigo), parseInt(cantidad), comprador);

        pausa().then(() => {
            resolve();
        });
    });
};

const obtenerCodigoProducto = () => {
    return new Promise((resolve) => {
        readline.question('Código del producto a comprar: ', (codigo) => {
            resolve(codigo);
        });
    });
};

const obtenerCantidadCompra = () => {
    return new Promise((resolve) => {
        readline.question('Cantidad a comprar: ', (cantidad) => {
            resolve(cantidad);
        });
    });
};

const nuevaOperacion = (mensaje) => {
    return new Promise((resolve) => {
        readline.question(`${mensaje} (si/no): `, (respuesta) => {
            resolve(respuesta);
        });
    });
};


const main = async () => {
    console.clear();
    let productostienda = new ProductosTienda();
    await productostienda.cargarProductosDesdeArchivo();

    let opcion;

    do {
        opcion = await mostrarMenu();

        switch (opcion) {
            case '1':
                console.clear();
                console.log('=== AGREGAR NUEVO PRODUCTO ==='.cyan);
                const nuevoProducto = await obtenerDetallesProducto();
                await agregarProducto(productostienda, nuevoProducto);
                const respuestaAgregarProducto = await nuevaOperacion('¿Desea agregar otro producto?');
                if (respuestaAgregarProducto.toLowerCase() !== 'si') {
                    await pausa();
                }
                break;

            case '2':
                console.clear();
                console.log('=== LISTA DE PRODUCTOS ==='.cyan);
                productostienda.mostrarProductos();
                await pausa();
                break;

            case '3':
                do {
                    console.clear();
                    console.log('=== BORRAR PRODUCTO ==='.cyan);
                    console.log('=== SELECCIONE EL PRODUCTO ==='.cyan);
                    productostienda.mostrarProductos();

                    await new Promise((resolve) => {
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

                            resolve();
                        });
                    });

                    const respuestaBorrarProducto = await nuevaOperacion('¿Desea borrar otro producto?');
                    if (respuestaBorrarProducto.toLowerCase() !== 'si') {
                        break;
                    }
                } while (true);
                break;

            case '4':
                await realizarCompra(productostienda);
                break;

            case '5':
                await gestionarCopiaSeguridad(productostienda);
                break;

                case '6':
                    console.clear();
                    console.log('=== GENERAR FACTURA ==='.cyan);
                    productostienda.carrito.generarFacturaGuardada(); 
                    await pausa();
                    break;
                    
            case '7':
                console.log('=== PROGRAMA FINALIZADO ==='.bgMagenta);
                break;

            default:
                console.log('Opción no válida. Por favor, elige una opción válida.'.bgRed);
                await pausa();
                break;
        }
    } while (opcion !== '7');

    readline.close();
};

main();
