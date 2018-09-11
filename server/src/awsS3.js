const AWS = require('aws-sdk')


AWS.config.update({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.signlanguage_uploader_access_key,
        secretAccessKey: process.env.signlanguage_uploader_secret_access_key,
    }
})

const awsS3 = new AWS.S3()

exports.awsS3 = awsS3
