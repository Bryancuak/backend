# Proyecto Cliente-Servidor en Python

Este proyecto implementa una aplicación cliente-servidor en Python que permite la comunicación entre varios clientes a través de mensajes de texto y la transferencia de archivos. Utiliza la biblioteca de sockets de Python para la transmisión de datos.

## Características

- Enviar y recibir mensajes de texto entre múltiples clientes.
- Transferir archivos entre clientes.
- Listar archivos disponibles en la carpeta local `Files` para enviar.
- Los archivos recibidos se guardan automáticamente en la carpeta `download`.

## Requisitos

- Python 3.10
- Biblioteca estándar de Python (`socket`, `threading`, `pickle`, `os`, `sys`)