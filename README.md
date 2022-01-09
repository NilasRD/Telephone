# Play Lab Telephone

Live website: [github.itu.dk/pages/mdaa/telephone](https://github.itu.dk/pages/mdaa/telephone)

## Technologies

- **LibreTranslate** - [https://translate.astian.org](https://translate.astian.org)
- **Web Speech API** - currently supported by Chrome and Safari
- **WebSocket**
- **Python 3** - as server

## Requirements

### Client

Only Chrome and Safari supports speech recognition (November 2021).

You can only connect to the server from **insecure (HTTP)** domains, not **secure (HTTPS)** domains. 

### Server

To run the server locally, install Python 3 and the required packages using `pip`.

```bash
pip install -r server/requirements.txt
```

Depending on your system, you may need to specify `pip3` for Python 3.

```bash
pip3 install -r server/requirements.txt
```

Then start the server with:

```bash
python server/server.py
```

## Extending the Project

### Chatbots

#### Adding additional RiveScript chatbots

You can add new RiveScript bots by creating two files and modifying one.

1. Add your `*.rive` script to `rive/`, like `rive/myBot/myBot.rive`.
   
2. Copy the `chatbotTemplate.js` inside `js/chatbots/` and give it a new name, like `myBot.js`
   
3. Also change the class name from `ChatbotTemplate` to your name, like `MyBot`
   
4. Open `myBot.js` and edit the following to include your `*.rive` script:
    ```javascript
    await this.bot.loadFile([
        './rive/myBot/myBot.rive',
    ]);
    ```
   
5. Open `js/chatbot.js` and add your newly created class `MyBot` to the array of chatbots. Look for something like:
    ```javascript
    _chatbots = [
        new AbstractChatbot('Real Human'), // <- this must stay!
        new Eliza('Eliza'),
        new MyBot('Name of Bot'),
    ];
    ```
   
You are done :)

#### Advanced processing of input

The `process()` function inside the chatbot classes, can be modified to do more complicated things. 
In its most basic form, it looks like:

```javascript
async process(text) {
    return await this.bot.reply(this.username, text);
}
```

Additional processing could be performed, like replacing a specific word before sending it to RiveScript

```javascript
async process(text) {
    // perform simple text replacement
    let result = text.replace('him', 'they');
    result = result.replace('her', 'they');
    
    // send to RiveScript bot
    result = await this.bot.reply(this.username, text);
    
    // return result
    return result;
}
```

### Personalities

New personalities can be added in almost the same way as chatbots. Check the `js/personalities` folder for examples.

When you are done with your new class, you add it to `js/personality.js` like

```javascript
_personalities = [
    new AbstractPersonality('None'), // <- this must stay!
    new Dog('Doggy'),
    new MyPersonality('Name of Personality'),
    // ...
];
```

All text processing must happen inside the `async process()` function of the personality class:

```javascript
async process(text) {
    // split the text into array of words, 
    const words = text.split(' ');
    
    // create empty string for constructing the final text
    let result = '';
    
    // modify each word (flip the gender)
    words.forEach(word => {
        result += word.replace('him', 'her');
        result += word.replace('her', 'him');
        result += ' '; // add a space
    });
    
    // return the final result
    return result;
 }
```

## Technical Notes

### Starting remote server

Starting the server in the background through SSH (on remote server):

```bash
nohup python3.9 /var/www/vhosts/telephone/server/server.py > /dev/null 2>&1 & echo $! > $HOME/playlab-server.pid
```

This will write the server process ID to `$HOME/playlab-server.pid` which can then later be used to kill the server:

```bash
# kill pid
kill "$(<$HOME/playlab-server.pid)"
```

### Re-directing domain to WebSocket using Apache 2.4

These are just notes for future reference.

Add a virtual host using proxies to redirect to another local port

```
# HTTP - does not work over HTTPS as the WebSocket is not secure
<VirtualHost *:80>
        ServerName playlab.amorten.com

        ProxyPreserveHost On
        ProxyRequests Off

        DocumentRoot "/var/www/vhosts/telephone/docs"

        <Directory "/var/www/vhosts/telephone/docs">
                Options Indexes FollowSymLinks MultiViews
                AllowOverride All
                Order allow,deny
                allow from all
        </Directory>

        # RiveScript mime type
        <FilesMatch "[^.]+\.rive$">
                SetHandler default-handler
                AddType text/plain rive
        </FilesMatch>

        # Redirect playlab.amorten.com/ws/ to port 8081 for handling WebSocket
        <Location /ws>
                ProxyPass ws://localhost:8081/
                ProxyPassReverse ws://localhost:8081/
        </Location>
</VirtualHost>
```