### Test Slave
Prerequisites:
Selenium and Protractor
- `npm install -g protractor`
- ( install ) java are ( http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html )
- run `webdriver-manager update`
- run `webdriver-manager start` 

Installing SLAVE
- `git clone https://github.com/yamii/test-slave`
- `npm install`

Run Slave
- `chown +x run-slave.sh`
- ./run-slave.sh REMOTE_HOST BASE_URL RETRY_COUNT SELENIUM_ADDRESS
	Where in : 
		REMOTE_HOST      is the ip config of master
		BASE_URL         is the url of the environment
		RETRY_COUNT      is the number of times slave request to reconnects to master in every 2 seconds
		SELENIUM_ADDRESS is the address of selenium
- Should be able to see in console:
IAM  [name of slave machine]
Im connected to the server
