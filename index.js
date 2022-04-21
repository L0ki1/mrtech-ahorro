const puppeteer = require('puppeteer');
const pd = require("node-pandas-js")
const fs = require('fs');
const axios = require('axios')
const { Cluster } = require('puppeteer-cluster');
const express = require('express') //llamamos a Express
const multer = require("multer");
const path = require("path");

let usando=false;
//172.26.15.163
const app = express();
app.listen(8083, "172.26.15.163", () => {
  console.log("Ya estoy escuchando en el puerto 8083");
});

let objMulter = multer({ dest: "./busqueda/" }); // Instantiate multer, el objeto de parámetro pasado, dest representa la ruta de almacenamiento del archivo cargado
app.use(objMulter.any()); // cualquier significa cualquier tipo de archivo
// app.use (objMulter.image ()) // Solo permite cargar tipos de imágenes

app.use(express.static("./busqueda"));





    
        const CreateFiles = fs.createWriteStream('precios/ahorro.csv');
        let csv="\ufeff"+"Sku,Titulo,Precio"+"\n"
        CreateFiles.write(csv)



async function myAsyncFunction(req,res){
       
    console.log("Escaneando ahorro");


const cluster = await Cluster.launch({
                concurrency: Cluster.CONCURRENCY_CONTEXT,
                maxConcurrency: 100,
                puppeteerOptions: {
                    headless: true,
                 args: ['--no-sandbox']
                }
              });


    bf = pd.readCsv("busqueda/skus_ahorro.csv")
    console.log("Escaneando...")
    
    let skus = bf.sku
    let i=0;
    if (!skus  ){
        usando=false;
        console.log("Escaneo detenido (formato erroneo)")

        return res.redirect('https://mrtech-mx.web.app/formato');

    }
        for(let sku of skus) {     
            let t=i+1;

console.log("Leyendo - "+t)
            
            await cluster.queue('https://www.fahorro.com/catalogsearch/result/?q='+sku);


            i++;

    
             
        }
    
       let ii=0;

        await cluster.task(async ({ page, data: url }) => {
            await page.setViewport({ width: 300, height: 900 });
            page.setJavaScriptEnabled(false)
           
            await page.setRequestInterception(true);
            page.on('request', (req) => {
            if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
            req.abort();
            }
            else {
            req.continue();
            }
            });

            const options = {
                waitUntil: 'networkidle2',
                timeout: 30000,
              };

                    await page.goto(url,options);

            const data = await page.evaluate(() => {
                let n="";
                let p="";
                let s="";
                const list = [];

                if( document.querySelector(".product-info-main h1")){
                n=  document.querySelector(".product-info-main h1").textContent
                }else{
                    n="?";
                }

                if( document.querySelector(".product-info-main .product-info-price .price")){
                    p=  document.querySelector(".product-info-main .product-info-price .price").textContent
                    }else{
                        p="?";
                    }

                    if( document.querySelector(".product-info-main .product-info-price .product-info-stock-sku .value")){
                        s=  document.querySelector(".product-info-main .product-info-price .product-info-stock-sku .value").textContent
                        }else{
                            s="?";
                        }

                
        list.push({
                nombre: n,
                precio: p,
                sku: s
        
        });

        

        return list
            });
            let sk="???";
            
            if(data[0].sku==undefined){
                data[0].sku=url.toString().split("q=")[1];
            }

            if(data[0].nombre==undefined){
                data[0].nombre=sk;
            }

            if(data[0].precio==undefined){
                data[0].precio=sk;
            }
        
            fs.appendFile('precios/ahorro.csv',data[0].sku+","+data[0].nombre.replace(/,/g, '')+","+data[0].precio.replace(/,/g, '')+"\n", (error) =>{
                if (error) console.log(error)
              });
let t=ii+1;
              console.log("Escaneando : " +t+"/"+skus.length)

if(t>=skus.length){
                console.log("Proceso terminado");

                var file = __dirname + '/precios/ahorro.csv'; res.download(file);
                usando=false;

            }
ii++;
            
        });    

        await cluster.idle();
        await cluster.close();
    
        cluster.on('taskerror', (err, data, willRetry) => {
            if (willRetry) {
              console.warn(`Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`);
            } else {
              console.error(`Failed to crawl ${data}: ${err.message}`);
              res.send({
                err: 1,
                msg:
                `Failed to crawl ${data}: ${err.message}`
              });
            }
        });

        }

        app.post("/api/ahorro", (req, res) => {
            if(!usando)
{
            usando=true;
            let oldName = req.files[0].path;
            let newName = "busqueda/skus_ahorro.csv"
            fs.renameSync(oldName, newName);
            myAsyncFunction(req,res);
}else{
    res.send({
        err: 1,
        msg:
        "Escaneo en progreso"
      });
}
          });
       // 

        
       
    



function delay(n){
    return new Promise(function(resolve){
        setTimeout(resolve,n);
        
    });
}


