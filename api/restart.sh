
#!/bin/bash
DIR=/Users/ajeet.mishra/Documents/bynders/api
netstat -ntlp |grep 4000 |awk '{print $4}' |awk -F: '{print $2}' /Users/ajeet.mishra/Documents/bynders/api/id.txt
kill -9 `cat /Users/ajeet.mishra/Documents/bynders/api/id.txt`
cd $DIR
/usr/bin/nohup  node server.js && 
fi
done
