import AWS from 'aws-sdk';
import bluebird from 'bluebird';
import EventEmitter from 'events';

let sns = null;
const eventEmitter = new EventEmitter();
const topicArns = []; // Caches topic ARNs

/**
 * Configures SNS setup.
 *
 * `init` should be called at most once.
 */
export function init(options) {
  sns = new AWS.SNS(options);
  bluebird.promisifyAll(sns);
}

/**
 * Adds event listener to the end of the listeners array for the event named
 * `eventName`.
 *
 * Returns a reference to the EventEmitter so calls can be chained.
 */
export function on(eventName, listener) {
  eventEmitter.on(eventName, listener);
  return eventEmitter;
}

/**
 * Returns a promise with the topic ARN of specified `topicName`. Returns `null`
 * when not found.
 *
 * Caches the results and returns the same result every time thereafter.
 */
export function getArn(topicName) {
  if (!sns) throw new Error('Must call sns.init(...) first');

  // Return from cache
  if (topicArns[topicName]) {
    return Promise.resolve(topicArns[topicName]);
  }

  // Recursive function which paginates through all user topics and returns
  // the ARN of specified topic. Stores the value in cache.
  function findArn(topicName, nextToken = null) {
    const params = {};
    if (nextToken !== null) {
      params.NextToken = nextToken;
    }
    return sns.listTopicsAsync(params).then((result) => {
      const arn = result.Topics.find(elm => elm.TopicArn.endsWith(`:${topicName}`));
      if (arn) {
        // Topic found, store value in cache
        topicArns[topicName] = arn.TopicArn;
        return topicArns[topicName];
      } else if (result.NextToken) {
        // Recursive call to look for the next page
        return findArn(topicName, result.NextToken);
      }
      return Promise.resolve(null); // Topic not found
    });
  }
  return findArn(topicName);
}

/**
 * Ensures the SNS topic exists and returns its topic ARN.
 */
export function createTopic(topicName) {
  if (!sns) throw new Error('Must call sns.init(...) first');

  eventEmitter.emit('log', 'info', `Creating SNS topic ${topicName}`);
  const params = {
    Name: topicName,
  };

  // Create topic if not already exists. Returns topic ARN.
  return sns.createTopicAsync(params).then((data) => data.TopicArn);
}

/**
 * Publishes a message to a SNS topic. The message body is converted to JSON.
 */
export function publish(topicName, message) {
  return getArn(topicName).then((arn) => {
    eventEmitter.emit('log', 'debug', `Sending message to SNS topic '${topicName}'`, message);
    const params = {
      TopicArn: arn,
      Message: JSON.stringify(message),
    };
    return sns.publishAsync(params).then((data) => data.MessageId);
  });
}

/**
 * Subscribes an SQS queue to an SNS topic.
 */
export function subscribeSqs(topicName, queueArn) {
  return getArn(topicName).then((topicArn) => {
    eventEmitter.emit('log', 'info', `Subscribe SQS queue '${queueArn}' to SNS topic '${topicArn}'`);
    const params = {
      Protocol: 'sqs',
      TopicArn: topicArn,
      Endpoint: queueArn,
    };
    return sns.subscribeAsync(params);
  });
}
