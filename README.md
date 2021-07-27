# Server Base - Proyecto ONG

## Envinroment setup

1. Create database bank_account
2. Inside server folder copy .env.example to .env and fill with database credentials.

## To run the project execute following commands in sequence

    1. cd server
    2. yarn install
    3. yarn sequelize-cli db:migrate
    4. yarn start
    5. cd ..
    6. yarn install
    7. yarn start