////////////////////////////////// Mise en contexte
// L'éternel combat des étudiants (et enseignants) de l'Université Laval 
// Un bon mardi matin, alors que vous vous rendez au cours de bases de données avancées en présentiel (dans un univers parallèle)
// vous tentez de trouver une place de stationnement abordable pour votre véhicule.
// Avec l'augmentation du prix des passes de stationnement, vous cherhez une alternative pour vous stationner aux alentours de l'Université Laval pour vos cours en présentiel.
//
// Vous utilisez votre grande expertise de MongoDB pour trouver le stationnement de vos rêves.
// Les critères donnés aux questions suivantes sont **CUMULATIFS**! 
// Par exemple, les critères de la question 4 comprennent aussi ceux de la question 3 et ainsi de suite !
//////
// Pour valider certaines de vos réponses, des formules de hachage vous seront présentées.
// Par exemple MD5(Q2 * Q3) signifie : On passe dans une fonction de hachage md5 le produit de la réponse à la Q2 et celle de la Q3 
// (en nombre entier et non en chaîne de caractères).
// Exemple: si Q2 = 10 et Q3 = 25 alors MD5(Q2 * Q3) = MD5(10 * 25) = MD5(250) = 6c9882bbac1c7093bd25041881277658
//////////////////////////////////

////////////////////////////////// Correction
// La correction est automatique et binaire. C'est-à-dire, que la correction est uniquement basée sur la bonne réponse.
//////////////////////////////////


////////////////////////////////// Aide technologique
// Votre p'tit chum Hackerman vous dit d'exécuter les lignes suivantes la PREMIÈRE fois uniquement:
// docker run -d --name devoir1 mongo:latest
// docker exec -it devoir1 mongosh mongodb+srv://string -u student -p glo4035
// Votre p'tit chum Hackerman vous dit d'exécuter les lignes suivantes les prochaines fois:
// docker stop devoir1
// docker start devoir1
// docker exec -it devoir1 mongosh mongodb+srv://string -u student -p glo4035
//////////////////////////////////


////////////////////////////////// Remise
// Écrivez vos réponses dans ce fichier (mongoDB.js) et déposez le fichier sur MonPortail à l'aide de la boîte de dépôt de cette évaluation. Aucun retard accepté.
//////////////////////////////////
// const connectionString = "mongodb+srv://string";
// db = connect(connectionString);

// Utilisez la base de données panneaux_ville_de_quebec
use panneaux_ville_de_quebec


// Liste les collections des documents de la base de données panneaux_ville_de_quebec et créé une variable points_panneaux qui pointe vers la collection.
// Cette variable contient les documents pour le devoir.
show collections
points_panneaux = db['panneaux']


// 0. Créez une variable ulaval contenant un objet **géospatial** pouvant être utilisé pour faire des requêtes
// géospatiales. Utilisez les coordonnées suivantes. latitude = 46.77898, longitude = -71.26975.
// Ce sont des coordonnées du pavillon Charles-De Koninck qui est situé au centre de l'Université Laval.
// (0 point)
print('#Q0')
var ulaval = {
    type: "Point",
    coordinates: [-71.26975, 46.77898]
}

// 1. Quel champ de la base de données contient un index géospatial? Je cherche une chaîne de caractère et vous devez l'obtenir avec une requête!
// (1 point)
print("#Q1")
points_panneaux.getIndexes().filter(index => Object.values(index.key).includes("2dsphere")).map(index => Object.keys(index.key)[0])[0]

// 2. Combien de panneaux de signalisation y a-t-il dans un rayon de 1,1 kilomètre du pavillon Charles-De Koninck de l'Université Laval?
// (1 point)
print("#Q2")
points_panneaux.aggregate([
    {
        $geoNear: {
            near: ulaval,
            distanceField: "dist",
            maxDistance: 1100,
            spherical: true
        }
    }
]).itcount()


// 3. Combien de panneaux de signalisation y a-t-il dans la zone précédente si on enlève les panneaux de signalisation à l'intérieur de 700 mètres?
// MD5(Q2 * Q3) = dc19f9d7f187dd9be6363d896148f384
// (2 points)
print("#Q3")
points_panneaux.aggregate([
    {
        $geoNear: {
            near: ulaval,
            distanceField: "dist",
            minDistance: 700,
            maxDistance: 1100,
            spherical: true
        }
    }
]).itcount()

// 4. Combien de panneaux de signalisation y a-t-il dans la zone précédente si on enlève les panneaux d'interdiction de stationnement de ce côté (PP1050), 
// les panneaux d'interdiction de stationnement dans cette rue (PP1060), les panneaux d'interdiction de stationnement (PP1011, PP1012 et PP1013), les panneaux
// de stationnement du lundi au vendredi (PP1424, PP1425, PP1915, PP1916, PP2091, PP2092, PP2093), les panneaux 
// de stationnement le mardi durant la plage horaire du cours (PP1031, PP1032, PP1033, PP1091, PP1092, PP1093, PP1101, PP1102, PP1103, PP1104, PP1105, PP1106, PP1112, 
// PP1113, PP1917, PP1918, PP1933, PP2007, PP2008, PP2009), et les panneaux d'aire de stationnement des autobus et taxis (PP1142, PP1696)?
// MD5(Q3 * Q4) = fd07b54170df1ee5062afa89905d7511
// (2 points)
print("#Q4")
var panneauxExclus = [
    "PP1050", "PP1060", "PP1011", "PP1012", "PP1013", 
    "PP1424", "PP1425", "PP1915", "PP1916", "PP2091", 
    "PP2092", "PP2093", "PP1031", "PP1032", "PP1033", 
    "PP1091", "PP1092", "PP1093", "PP1101", "PP1102", 
    "PP1103", "PP1104", "PP1105", "PP1106", "PP1112", 
    "PP1113", "PP1917", "PP1918", "PP1933", "PP2007", 
    "PP2008", "PP2009", "PP1142", "PP1696"
];

points_panneaux.aggregate([
    {
        $geoNear: {
            near: ulaval,
            distanceField: "dist",
            key: "geometry",
            spherical: true,
            minDistance: 700,
            maxDistance: 1100,
            query: { 
                "properties.TYPE_CODE": { $nin: panneauxExclus },
            }
        }
    }
]).itcount()


// 5.Combien de panneaux de signalisation y a-t-il dans la zone précédente si on enlève les panneaux de stationnements de zone autour de l'université ? C'est-à-dire, de retirer les panneaux qui contienne le mot
// "ZONE" dans la description du panneau.
// Astuce: Pour effectuer une recherche dans une chaîne de caractère il faut utiliser l'opérateur d'expression régulière $regex https://www.mongodb.com/docs/v5.0/reference/operator/query/regex/.
// MD5(Q4 * Q5) = 3542cd151f9febc8b69c7f021f271e0e 
// (3 points)
print("#Q5")
points_panneaux.aggregate([
    {
        $geoNear: {
            near: ulaval,
            distanceField: "dist",
            key: "geometry",
            spherical: true,
            minDistance: 700,
            maxDistance: 1100,
            query: { 
                "properties.TYPE_CODE": { $nin: panneauxExclus },
                "properties.DESCRIPTION": { $not: {$regex:/ZONE/ } }
            }
        }
    }
]).itcount()


// 6. Combien de panneaux de signalisation y a-t-il dans la zone précédente si on enlève les panneaux de débarcadère et de stationnement interdit saisonnier du 1er mai au 31 octobre,
// du 1er avril au 14 novembre et du 15 novembre au 31 mars?
// Astuce: Pour effectuer une recherche dans une chaîne de caractère il faut utiliser l'opérateur d'expression régulière $regex https://www.mongodb.com/docs/v5.0/reference/operator/query/regex/.
// Astuce: Il y a une faute dans l'écriture de l'une des dates dans le jeu de données. Ça l'air que la Ville de Québec ne sait pas bien écrire.
// MD5(Q5 * Q6) = 8a7b7dbd53d5c4d0566bd55f0b534ee0
// (3 points)
print("#Q6")
points_panneaux.aggregate([
    {
        $geoNear: {
            near: ulaval,
            distanceField: "dist",
            key: "geometry",
            spherical: true,
            minDistance: 700,
            maxDistance: 1100,
            query: {
                "properties.TYPE_CODE": { $nin: panneauxExclus },
                "properties.DESCRIPTION": { $not: {$regex:/ZONE/ } },
                $nor: [
                    { "properties.DESCRIPTION": { $regex: /débarcadère/i } },
                    { "properties.DESCRIPTION": { $regex: /(MAI.*OCT)|(AVR.*NOV)|(NOV.*MAR)/i } },
                ]
            }
        }
    }
]).itcount()


// 7. Combien de panneaux de signalisation y a-t-il dans la zone précédente si on enlève les panneaux de stationnement pour une durée de 90 minutes et moins?
// Astuce: Pour effectuer une recherche dans une chaîne de caractère il faut utiliser l'opérateur d'expression régulière $regex https://www.mongodb.com/docs/v5.0/reference/operator/query/regex/.
// Astuce: Attention à la manière d'écrire minute, une recherche textuelle est sensible à la case (voir les options de la commande).
// Astuce: Il y a deux façons d'écrire minute dans les descriptions des panneaux.
// MD5(Q6 * Q7) = 5e2cf9121bafd664871209de0789da56 
// (3 points)
print("#Q7")
points_panneaux.aggregate([
    {
        $geoNear: {
            near: ulaval,
            distanceField: "dist",
            key: "geometry",
            spherical: true,
            minDistance: 700,
            maxDistance: 1100,
            query: {
                "properties.TYPE_CODE": { $nin: panneauxExclus },
                "properties.DESCRIPTION": { $not: {$regex:/ZONE/ } },
                $nor: [
                    { "properties.DESCRIPTION": { $regex: /débarcadère/i } },
                    { "properties.DESCRIPTION": { $regex: /(MAI.*OCT)|(AVRIL.*NOV)|(NOV.*MARS)/i } },
                    { "properties.DESCRIPTION": { $regex: /Stat. (90|[1-8]\d|[1-9]) min(utes)?/i } }
                ]
            }
        }
    }
]).itcount()


// 8. Quel(s) est/sont le(s) type(s) de panneau (TYPE_CODE) des panneaux permettant de stationner 120 minutes de 8h à 18h du lundi au vendredi ?
// Astuce: Pour effectuer une recherche dans une chaîne de caractère il faut utiliser l'opérateur d'expression régulière $regex https://www.mongodb.com/docs/v5.0/reference/operator/query/regex/.
// (3 points)
print("#Q8")
points_panneaux.aggregate([
    {
        $geoNear: {
            near: ulaval,
            distanceField: "dist",
            key: "geometry",
            spherical: true,
            minDistance: 700,
            maxDistance: 1100,
            query: {
                "properties.TYPE_CODE": { $nin: panneauxExclus },
                "properties.DESCRIPTION": { $not: {$regex:/ZONE/ } },
                $nor: [
                    { "properties.DESCRIPTION": { $regex: /débarcadère/i } },
                    { "properties.DESCRIPTION": { $regex: /(MAI.*OCT)|(AVRIL.*NOV)|(NOV.*MARS)/i } },
                    { "properties.DESCRIPTION": { $regex: /Stat. (90|[1-8]\d|[1-9]) min(utes)?/i } },
                ],
                "properties.DESCRIPTION": {$regex: /Stat. (120) min(utes)? 8h - 18h LUN À VEN/i },
            }
        }
    },
    {
        $group: {
            _id: "$properties.TYPE_CODE",
            // count: { $sum: 1 }
        }
    }
])

/*
Annexe: voici tous les liens des ressources que j'ai pu utiliser pour réaliser ce travail

Question 0 : https://www.mongodb.com/docs/drivers/java/sync/current/crud/query-documents/geo/

code :
var ulaval = {
    type: "Point",
    coordinates: [-71.26975, 46.77898]
}


Question 1 :

code:
points_panneaux.find()
après des informations supplémentaires :
points_panneaux.getIndexes().filter(index => Object.values(index.key).includes("2dsphere")).map(index => Object.keys(index.key)[0])[0]



Question 2 : https://www.mongodb.com/docs/manual/reference/operator/aggregation/geoNear/#mongodb-pipeline-pipe.-geoNear

code:
points_panneaux.aggregate([
    {
        $geoNear: {
            near: ulaval,
            distanceField: "dist",
            maxDistance: 1100,
            spherical: true
        }
    }
]).itcount()


Question 3 :

code:
points_panneaux.aggregate([
    {
        $geoNear: {
            near: ulaval,
            distanceField: "dist",
            minDistance: 700,
            maxDistance: 1100,
            spherical: true
        }
    }
]).itcount()

Question 4 : https://www.mongodb.com/docs/manual/reference/operator/query/nin/

code:
var panneauxExclus = [
    "PP1050", "PP1060", "PP1011", "PP1012", "PP1013", 
    "PP1424", "PP1425", "PP1915", "PP1916", "PP2091", 
    "PP2092", "PP2093", "PP1031", "PP1032", "PP1033", 
    "PP1091", "PP1092", "PP1093", "PP1101", "PP1102", 
    "PP1103", "PP1104", "PP1105", "PP1106", "PP1112", 
    "PP1113", "PP1917", "PP1918", "PP1933", "PP2007", 
    "PP2008", "PP2009", "PP1142", "PP1696"
];

points_panneaux.aggregate([
    {
        $geoNear: {
            near: ulaval,
            distanceField: "dist",
            key: "geometry",
            spherical: true,
            minDistance: 700,
            maxDistance: 1100,
            query: { 
                "properties.TYPE_CODE": { $nin: panneauxExclus },
            }
        }
    }
]).itcount()

Question 5 : https://www.mongodb.com/docs/v5.0/reference/operator/query/regex/

code:
points_panneaux.aggregate([
    {
        $geoNear: {
            near: ulaval,
            distanceField: "dist",
            key: "geometry",
            spherical: true,
            minDistance: 700,
            maxDistance: 1100,
            query: { 
                "properties.TYPE_CODE": { $nin: panneauxExclus },
                "properties.DESCRIPTION": { $not: {$regex:/ZONE/ } }
            }
        }
    }
]).itcount()


Question 6 : https://www.mongodb.com/docs/manual/reference/operator/query/nor/

code:
points_panneaux.aggregate([
    {
        $geoNear: {
            near: ulaval,
            distanceField: "dist",
            key: "geometry",
            spherical: true,
            minDistance: 700,
            maxDistance: 1100,
            query: {
                "properties.TYPE_CODE": { $nin: panneauxExclus },
                "properties.DESCRIPTION": { $not: {$regex:/ZONE/ } },
                $nor: [
                    { "properties.DESCRIPTION": { $regex: /débarcadère/i } },
                    { "properties.DESCRIPTION": { $regex: /(MAI.*OCT)|(AVR.*NOV)|(NOV.*MAR)/i } },
                ]
            }
        }
    }
]).itcount()


Question 7 :

code:
points_panneaux.aggregate([
    {
        $geoNear: {
            near: ulaval,
            distanceField: "dist",
            key: "geometry",
            spherical: true,
            minDistance: 700,
            maxDistance: 1100,
            query: {
                "properties.TYPE_CODE": { $nin: panneauxExclus },
                "properties.DESCRIPTION": { $not: {$regex:/ZONE/ } },
                $nor: [
                    { "properties.DESCRIPTION": { $regex: /débarcadère/i } },
                    { "properties.DESCRIPTION": { $regex: /(MAI.*OCT)|(AVRIL.*NOV)|(NOV.*MARS)/i } },
                    { "properties.DESCRIPTION": { $regex: /Stat. (90|[1-8]\d|[1-9]) min(utes)?/i } }
                ]
            }
        }
    }
]).itcount()

Question 8: https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/ pour regroupper et voir toutes les réponses car 100+ résultats
            https://www.mongodb.com/docs/manual/reference/operator/aggregation/sum/ pour faire la somme et voir le nombre de panneaux, je l'ai mis car c'est dans la doc
            Pour etre sur de ma réponse, j'ai regardé sans le filtre de distance, c'est les 3 meme panneaux qui ressortent

code:
points_panneaux.aggregate([
    {
        $geoNear: {
            near: ulaval,
            distanceField: "dist",
            key: "geometry",
            spherical: true,
            minDistance: 700,
            maxDistance: 1100,
            query: {
                "properties.DESCRIPTION": {$regex: /Stat. (120) min(utes)? 8h - 18h LUN À VEN/i },
            }
        }
    },
    {
        $group: {
            _id: "$properties.TYPE_CODE",
            count: { $sum: 1 }
        }
    }
])

note: Petit point stat, dans la zone de 700-1100 m, il y a 133 panneaux "PS3163", 5 panneaux "PS3162" et 6 panneaux "PS3161".

Checking des résultats : 

Q2: 1473
Q3: 995
Q4: 846
Q5: 485
Q6: 455
Q7: 335
avec les MD5 :
MD5(Q2 * Q3) = dc19f9d7f187dd9be6363d896148f384 : MD5(1473 * 995) <=> MD5(1465635) = dc19f9d7f187dd9be6363d896148f384
MD5(Q3 * Q4) = fd07b54170df1ee5062afa89905d7511 : MD5(995 * 846) <=> MD5(841770) = fd07b54170df1ee5062afa89905d7511
MD5(Q4 * Q5) = 3542cd151f9febc8b69c7f021f271e0e : MD5(846 * 485) <=> MD5(410310) = 3542cd151f9febc8b69c7f021f271e0e
MD5(Q5 * Q6) = 8a7b7dbd53d5c4d0566bd55f0b534ee0 : MD5(485 * 455) <=> MD5(220675) = 8a7b7dbd53d5c4d0566bd55f0b534ee0
MD5(Q6 * Q7) = 5e2cf9121bafd664871209de0789da56 : MD5(455 * 335) <=> MD5(152425) = 5e2cf9121bafd664871209de0789da56

*/
