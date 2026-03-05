FROM eclipse-temurin:25-jdk-alpine AS api-build
WORKDIR /app
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src
RUN chmod +x mvnw
RUN ./mvnw clean install -DskipTests