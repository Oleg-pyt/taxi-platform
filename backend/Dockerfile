# Build backend
FROM eclipse-temurin:25-jdk-jammy AS build

WORKDIR /app

COPY --from=api /root/.m2 /root/.m2

COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

RUN ./mvnw dependency:go-offline

COPY src ./src

# build without tests
RUN ./mvnw clean package -DskipTests

# Runtime
FROM eclipse-temurin:25-jdk-jammy
WORKDIR /app

COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]