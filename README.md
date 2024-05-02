to be able to sign the cookies you will need a `keypair.pem` file
read [this](https://stackoverflow.com/a/44474607/18598975) stack overflow answer

`openssl genrsa -out keypair.pem 2048`
`openssl rsa -in keypair.pem -pubout -out publickey.crt`

# Recommended extension

[LDAP Explorer](https://marketplace.visualstudio.com/items?itemName=fengtan.ldap-explorer)
Follow extension docs for how to config.
