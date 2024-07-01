const fs = require("fs");
const http = require("http");
const readline = require("readline");
const url = require("url");
const { StringDecoder } = require("string_decoder");


/* Création du serveur
Au lancement du serveur, on affiche la première ligne du fichier data*/
// Fonction pour lire la première ligne d'un fichier
const readFirstLine = (filePath) => {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    rl.on("line", (line) => {
      rl.close();
      resolve(line);
    });

    rl.on("error", (err) => {
      reject(err);
    });
  });
};
// Fonction pour lire toutes les lignes d'un fichier
const readAllLines = (filePath) => {
  return new Promise((resolve, reject) => {
    const lines = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    rl.on("line", (line) => {
      lines.push(line);
    });

    rl.on("close", () => {
      resolve(lines);
    });

    rl.on("error", (err) => {
      reject(err);
    });
  });
};
// Fonction pour écrire une ligne dans un fichier
const writeLine = (filePath, line) => {
  return new Promise((resolve, reject) => {
    fs.appendFile(filePath, line + "\n", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
// Chemin du fichier à lire
const filePath = "data.txt";
// Lire la première ligne du fichier
readFirstLine(filePath)
  .then((firstLine) => {
    // Créer le serveur HTTP
    const server = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url, true);
      const path = parsedUrl.pathname;

      if (path === "/api/data" && req.method === "GET") {
        readAllLines(filePath)
          .then((lines) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            res.end(JSON.stringify(lines));
          })
          .catch((err) => {
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/plain");
            res.end("Erreur lors de la lecture du fichier.");
            console.error(err);
          });
      } else if (path === "/api/data" && req.method === "POST") {
        const decoder = new StringDecoder("utf-8");
        let buffer = "";
        req.on("data", (chunk) => {
          buffer += decoder.write(chunk);
        });

        req.on("end", () => {
          buffer += decoder.end();

          let data;
          try {
            data = JSON.parse(buffer);
          } catch (err) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "text/plain");
            res.end("Données JSON invalides.");
            return;
          }

          if (typeof data.line === "string") {
            writeLine(filePath, data.line)
              .then(() => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/plain");
                res.end("Ligne ajoutée avec succès.");
              })
              .catch((err) => {
                res.statusCode = 500;
                res.setHeader("Content-Type", "text/plain");
                res.end("Erreur lors de l'écriture dans le fichier.");
                console.error(err);
              });
          }
        });
      } else if (path === "/") {
        // Servir le fichier HTML
        fs.readFile("index.html", (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/plain");
            res.end("Erreur lors de la lecture du fichier HTML.");
            console.error(err);
          } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.end(data);
          }
        });
      } else {
        res.statusCode = 400;
        res.setHeader("Content-Type", "text/plain");
        res.end("Route utilisée incorrecte .");
      }
    });
    // Lancer le serveur
    const port = 3000;
    server.listen(port, () => {
      console.log(`Le serveur est lancé sur http://localhost:${port}/`);
      console.log(`La première ligne du fichier est : ${firstLine}`);
    });
  })
  .catch((err) => {
    console.error("Erreur lors de la lecture du fichier :", err);
  });
