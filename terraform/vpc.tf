resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/20"

  tags = {
    Name = "todoapp-vpc"
  }

}

#public subnet 

resource "aws_subnet" "public_1" {

  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.0.0/24"
  availability_zone       = "ca-west-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "todoapp-public-subnet-1-ca-west-1a"
  }

}

resource "aws_subnet" "public_2" {

  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ca-west-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "todoapp-public-subnet-2-ca-west-1b"
  }

}

#private Subnet
resource "aws_subnet" "private_1" {

  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "ca-west-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "todoapp-private-subnet-1-ca-west-1a"
  }

}

resource "aws_subnet" "private_2" {

  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.3.0/24"
  availability_zone       = "ca-west-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "todoApp-private-subnet-2-ca-west-1b"
  }

}

#Internet Gateway

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "todoapp-igw"
  }

}

#Elastic IP for NAT gw

resource "aws_eip" "nat" {

  domain = "vpc"

  tags = {
    Name = "todoapp-nat-eip"
  }

  depends_on = [aws_internet_gateway.main]
}




#NAT gw's (one per AZ  in ca-west-1a)

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_1.id

  tags = {
    Name = "todoapp-nat-ca-west-1a"
  }

  depends_on = [aws_internet_gateway.main]
}

# public Route Table

resource "aws_route_table" "public" {

  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "todoapp-public-rt"
  }

}

#Link public rt's with Public subnets 

resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}
resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

#Private rt shared by both private subnets

resource "aws_route_table" "private" {

  vpc_id = aws_vpc.main.id

  tags = {
    Name = "todoapp-private-rt"
  }

}

# ECS tasks are in private subnets but need internet access to pull Docker images!
resource "aws_route" "private_nat" {
  route_table_id         = aws_route_table.private.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.main.id
}

#link private rt with both private subnets

resource "aws_route_table_association" "private_1" {

  subnet_id      = aws_subnet.private_1.id
  route_table_id = aws_route_table.private.id

}

resource "aws_route_table_association" "private_2" {

  subnet_id      = aws_subnet.private_2.id
  route_table_id = aws_route_table.private.id

}

