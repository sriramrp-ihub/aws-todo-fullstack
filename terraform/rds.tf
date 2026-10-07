
# DB Subnet Group 
resource "aws_db_subnet_group" "main" {
  name       = "todoapp-db-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  tags = {
    Name = "todoapp-db-subnet-group"
  }
}

# RDS MySQL Instance
resource "aws_db_instance" "main" {
  identifier     = "todoapp-db"
  engine         = "mysql"
  engine_version = "8.0"


  instance_class = "db.t3.micro"


  allocated_storage     = 20 # GB
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  # Database
  db_name  = "todoapp"
  username = "todouser"
  password = "TodoApp2026SecurePassword!" # will use secret manager
  port     = 3306

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false # Keep private!

  # Backups
  backup_retention_period = 1
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  # High Availability
  multi_az = false # Will be true for production

  # Deletion protection
  deletion_protection       = false # will be set to true for production
  skip_final_snapshot       = true  # ill be set false for production
  final_snapshot_identifier = "todoapp-db-final-snapshot"

  # Performance
  enabled_cloudwatch_logs_exports = ["error", "general", "slowquery"]

  tags = {
    Name = "todoapp-db"
  }
}


