function getUnread() {
  
  var keystr = '[Ticket #'
  var response = GmailApp.search('is:unread');
  for (var i = 0; i < response.length; i++) {
    var subject = response[i].getFirstMessageSubject().trim();
    if (subject.includes(keystr)) {
      var threadMessages = response[i].getMessages();
      var organization = threadMessages[0].getFrom().trim();
      var str = threadMessages[0].getPlainBody();
      var assignee = strInBetween(str, 'Assignee: ', ' Ticket URL').trim();
      var priority = strInBetween(str, 'Priority: ', 'Creator').trim();
      var details = 
          `
      ${subject}
      Organization: ${organization}
      Assignee: ${assignee}
      Priority: ${priority}
      `
      postDiscord(details);
      response[i].markRead();
    }
  }
}

function postDiscord(message) {
  // Make a POST request with a JSON payload.
  var url = getValueByKey('WEBHOOK_URL');
  var data = {
    'content': message
  };
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    // Convert the JavaScript object to a JSON string.
    'payload' : JSON.stringify(data)
  };
  UrlFetchApp.fetch(url, options);
}

function strInBetween(str, first, last) {
  var inbetween = str.substring (
        str.lastIndexOf(first) + first.length, 
        str.lastIndexOf(last)
      );
  return inbetween;
}

function getValueByKey(key) {
  var scriptProperties = PropertiesService.getScriptProperties();
  var value = scriptProperties.getProperty(key);
  return value;
}

function runEvery10Minutes() {
  ScriptApp.newTrigger("getUnread")
  .timeBased()
  .everyMinutes(10)
  .create();
}
