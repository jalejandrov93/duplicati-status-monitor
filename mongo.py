from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# Reemplaza con tu URI real de MongoDB Atlas
MONGO_URI = "mongodb+srv://rootltsm_db_user:X3zIGrxP5aLimjXM@ltsmcluster.j10vv95.mongodb.net/?retryWrites=true&w=majority&appName=LTSMCluster"

def test_connection():
    try:
        client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=5000  # 5 segundos de timeout
        )

        # Forzamos una operación para validar conexión
        client.admin.command("ping")

        print("✅ Conexión exitosa a MongoDB Atlas")

        # Listar bases de datos (opcional)
        databases = client.list_database_names()
        print("📂 Bases de datos disponibles:")
        for db in databases:
            print(f" - {db}")

    except ConnectionFailure as e:
        print("❌ No se pudo conectar a MongoDB")
        print(e)

    finally:
        client.close()

if __name__ == "__main__":
    test_connection()
