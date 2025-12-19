sudo docker exec -i d4cee3fbb71c psql -U syrenity -d syrenity -c "CREATE DATABASE syrenity_test;"
sudo docker exec -i d4cee3fbb71c psql -U syrenity -d syrenity < kys.sql
