# Stage 1: Building the .NET backend
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["HR_ClientManagement_WebAPI/*.csproj", "HR_ClientManagement_WebAPI/"]
RUN dotnet restore "HR_ClientManagement_WebAPI/HR_ClientManagement_WebAPI.csproj"

# Copy the rest of the backend code and build
COPY ["HR_ClientManagement_WebAPI/", "HR_ClientManagement_WebAPI/"]
WORKDIR "/src/HR_ClientManagement_WebAPI"
RUN dotnet build "HR_ClientManagement_WebAPI.csproj" -c Release -o /app/build

# Stage 2: Publish the .NET backend
FROM backend-build AS backend-publish
RUN dotnet publish "HR_ClientManagement_WebAPI.csproj" -c Release -o /app/publish

# Stage 3: Build the React frontend
FROM node:18 AS frontend-build
WORKDIR /src

# Copy package.json and install dependencies
COPY ["react-app/package.json", "react-app/package-lock.json*", "./"]
RUN npm install

# Copy the rest of the frontend code and build
COPY ["react-app/", "./"]
RUN npm run build

# Stage 4: Final image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Install PostgreSQL client for database migrations
RUN apt-get update && apt-get install -y postgresql-client

# Copy published backend
COPY --from=backend-publish /app/publish .

# Copy built frontend to wwwroot
COPY --from=frontend-build /src/dist ./wwwroot

# Expose port
EXPOSE 80
EXPOSE 443

# Set environment variables
ENV ASPNETCORE_URLS=http://+:80
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

# Create entrypoint script
RUN echo '#!/bin/bash\n\
# Wait for PostgreSQL to be ready\n\
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do\n\
  echo "Waiting for PostgreSQL to be ready..."\n\
  sleep 2\n\
done\n\
\n\
# Run the application\n\
dotnet HR_ClientManagement_WebAPI.dll\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
