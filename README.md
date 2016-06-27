# SNS

A wrapper for [AWS SNS](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html), providing promises and a set of convenience methods.

**NOTE**: this library is not very customizable nor will it be, its intent is to serve as a standard for my personal projects. There are only few tests because its use is extensively tested in component tests.

## init(options)

Run `init(options)` before executing any statements.

```js
import * as sns from '@nielskrijger/sns';

sns.init({
  region: 'eu-west-1',
});
```

Other connection options can be found in the [AWS SNS](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html) documentation.

## getArn(topicName)

Returns a promise with the topic ARN of specified `topicName`. Returns `null` when not found.

Caches the results and returns the same result every time thereafter.

```js
sns.getArn('my-topic').then((arn) => {
  console.log(arn); // arn:aws:sns:eu-west-1:1234567890:my-topic
});
```

# createTopic(topicName)

Ensures the SNS topic exists and returns its topic ARN.

```js
sns.createTopic('my-topic').then((topicArn) => {
  console.log(topicArn); // arn:aws:sns:eu-west-1:1234567890:my-topic
});
```

## publish(topicName, message)

Publishes a message to a SNS topic and returns the AWS response. The message body is converted to JSON.

```js
const body = {
  action: 'deleteUser',
  user_id: 'a4bl35gsl'
};
sns.publish('my-topic', body).then((messageId) => {
  console.log(messageId); // Contains `MessageId` of published message
});
```

## subscribeSqs(topicName, queueArn)

Subscribes an SQS queue to an SNS topic.

```js
sns.subscribeSqs('my-topic', 'arn:aws:sqs:eu-west-1:1234567890:my-queue').then((result) => {
  console.log(result); // Contains AWS response
});
```

## Logging

```js
import * as sns from '@nielskrijger/sns';

sns.on('log', (level, message, object) => {
  console.log(`Log event: ${level}, ${message}, ${object}`);
});
```

The library returns log messages with levels `debug`, `info` and `error`.
