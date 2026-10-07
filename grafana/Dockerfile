
FROM grafana/grafana:latest

COPY --chown=grafana:root provisioning /etc/grafana/provisioning

EXPOSE 3000


USER grafana



ENV GF_SECURITY_ADMIN_USER=admin
ENV GF_SECURITY_ADMIN_PASSWORD=admin
ENV GF_AUTH_ANONYMOUS_ENABLED=false
ENV GF_INSTALL_PLUGINS=