import socket
import threading
import sys
import pickle
import os

class Cliente():
    def __init__(self, host="localhost", port=7000):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((str(host), int(port)))

        # Crear las carpetas 'download' y 'Files' si no existen
        if not os.path.exists('download'):
            os.makedirs('download')
        if not os.path.exists('Files'):
            os.makedirs('Files')

        msg_recv = threading.Thread(target=self.msg_recv)
        msg_recv.daemon = True
        msg_recv.start()

        while True:
            opcion = input('¿Quieres enviar un mensaje, enviar un archivo o listar archivos (m/a/ls)? ')
            if opcion == 'm':
                msg = input('-> ')
                if msg != 'salir':
                    self.send_msg(msg)
                else:
                    self.sock.close()
                    sys.exit()
            elif opcion == 'a':
                file_path = input('Introduce la ruta del archivo (dentro de la carpeta Files): ')
                full_path = os.path.join('Files', file_path)
                self.send_file(full_path)
            elif opcion == 'ls':
                self.list_files()

    def msg_recv(self):
        while True:
            try:
                data = self.sock.recv(4096)
                if data:
                    packet = pickle.loads(data)
                    if packet['type'] == 'msg':
                        print(f"Mensaje: {packet['content']}")
                    elif packet['type'] == 'file':
                        file_name = packet['file_name']
                        file_size = packet['file_size']
                        # Guardar el archivo en la carpeta 'download'
                        file_path = os.path.join('download', file_name)
                        with open(file_path, 'wb') as f:
                            bytes_recv = 0
                            while bytes_recv < file_size:
                                chunk = self.sock.recv(4096)
                                f.write(chunk)
                                bytes_recv += len(chunk)
                        print(f"Archivo recibido: {file_name} (guardado en la carpeta 'download')")
            except:
                pass

    def send_msg(self, msg):
        try:
            packet = {'type': 'msg', 'content': msg}
            self.sock.send(pickle.dumps(packet))
        except:
            print('Error al enviar el mensaje')

    def send_file(self, file_path):
        try:
            with open(file_path, 'rb') as f:
                file_data = f.read()
            print("Enviando archivo...")
            file_name = os.path.basename(file_path)
            file_size = os.path.getsize(file_path)
            packet = {'type': 'file', 'file_name': file_name, 'file_size': file_size}
            self.sock.send(pickle.dumps(packet))  # Enviar metadatos del archivo
            self.sock.sendall(file_data)  # Enviar el archivo completo en bloques
            print(f"Archivo {file_name} enviado con exito desde la carpeta Files")
        except FileNotFoundError:
            print("Archivo no encontrado en la carpeta 'Files'")
        except:
            print("Error al enviar el archivo")

    def list_files(self):
        try:
            files = os.listdir('Files')
            if files:
                print("Archivos en la carpeta 'Files':")
                for file in files:
                    print(file)
            else:
                print("La carpeta 'Files' está vacía")
        except:
            print("Error al listar los archivos")

if __name__ == "__main__":
    cliente = Cliente()
