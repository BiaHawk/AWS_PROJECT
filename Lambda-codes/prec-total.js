var AWS = require("aws-sdk");
exports.handler = async() => {
    const result = await getObjectFromDynamoDB();

    return result;
};


async function getObjectFromDynamoDB() {
    var ddb = new AWS.DynamoDB();
    const today = new Date();
    let hh = today.getHours() - 3;
    let dd = "01";
    if (hh < 0) {
        dd = String(today.getDate() - 1).padStart(2, "0");
    } else {
        dd = String(today.getDate()).padStart(2, "0");
    }
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    console.log(yyyy, mm, dd);
    var params = {
        TableName: "Sensor",
        ExpressionAttributeValues: {
            ":d1": {
                S: yyyy + "-" + mm + "-" + dd,
            },
        },
        KeyConditionExpression: "DT_MEDICAO = :d1",
    };
    return new Promise((resolve, reject) => {
        ddb.query(params, function(err, resData) {
            if (err) {
                console.log("Error", err);
                reject(err);
            } else {
                console.log("Success", resData);
                if (resData.Count > 0) {
                    let returne = {
                        VALOR_OBSERVADO: 0,
                    };
                    let total = 0;
                    

                    for (let item of resData.Items) {
                        total += item.PREC.N;


                    }
                    returne.VALOR_OBSERVADO = total

                    resolve(returne);
                }
            }
        });
    });
}