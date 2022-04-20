const puppeteer = require('puppeteer');
const pd = require("node-pandas-js")
const fs = require('fs');
const axios = require('axios')
const { Cluster } = require('puppeteer-cluster');
const express = require('express') //llamamos a Express
const multer = require("multer");
const path = require("path");

let usando=false;

const app = express();
app.listen(80, "localhost", (err) => {
    if(err){
        console.log(err);
      }else{
        open('http://0.0.0.0:' + port);
      }});

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
                maxConcurrency: 10,
              });


    bf = pd.readCsv("busqueda/skus_ahorro.csv")
    console.log("Escaneando...")
    
    let skus = bf.sku
    let i=0;
        for(let sku of skus) {     
            let t=i+1;


            
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
                const list = []
        list.push({
                nombre: document.querySelector(".product-info-main h1")?.textContent,
                precio: document.querySelector(".product-info-main .product-info-price .price")?.textContent,
                sku: document.querySelector(".product-info-main .product-info-price .product-info-stock-sku .value")?.textContent
        
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

if(skus.length==t){
                console.log("Proceso terminado");

                const dataa = fs.readFileSync('precios/ahorro.csv',
            {encoding:'utf8', flag:'r'});
                res.send({
                    err: 0,
                    msg:
                    dataa
                  });
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
            console.log(oldName)
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


