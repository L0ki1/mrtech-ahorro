
const express = require('express') //llamamos a Express


//172.26.10.51
const app = express();
app.listen(8083, "172.26.10.51", () => {
  console.log("Ya estoy escuchando en el puerto 8083");
});


        app.get("/api/ahorro", (req, res) => {
            res.send(true);
            console.log("Busqueda en proceso");
        });
           
