var AWS = require("aws-sdk");
exports.handler = async(event) => {
    console.info("EVENT\n" + JSON.stringify(event, null, 2));

    const output = await Promise.all(
        event.records.map(async(record) => {


            let text = JSON.parse(
                Buffer.from(record.data, "base64").toString("ascii")
            );

            // let text = event.records[0].data
            try {
                await putObjectToDynamoDB(text);
                return {
                    recordId: record.recordId,
                    result: "Ok",
                };
            } catch {
                return {
                    recordId: record.recordId,
                    result: "DeliveryFailed",
                };
            }
        })
    );

    return { records: output };
};

async function putObjectToDynamoDB(data) {
    var ddb = new AWS.DynamoDB();

    const item = Object.keys(data).reduce(function(result, key) {
        if (typeof data[key] !== "number") {
            result[key] = { S: String(data[key]) };
        } else {
            result[key] = { N: String(data[key]) };
        }
        return result;
    }, {});

    var params = {
        TableName: "Sensor",
        Item: item,
    };
    return new Promise((resolve, reject) => {
        ddb.putItem(params, function(err, resData) {
            if (err) {
                console.log("Error", err);
                reject(err);
            } else {
                console.log("Success", resData);
                resolve(resData);
            }
        });
    });
}