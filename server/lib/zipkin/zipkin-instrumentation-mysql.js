'use strict';

const { Annotation, InetAddress } = require('zipkin');

function createMysqlTracer(config, tracer, Connection, serviceName, remoteServiceName) {
  const originalFn = Connection.query;

  Connection.query = function (sql, values, callback) {
    const id = tracer.createChildId();
    tracer.letId(id, () => {
      tracer.recordAnnotation(new Annotation.ClientSend());
      tracer.recordServiceName(serviceName);
      tracer.recordAnnotation(new Annotation.ServerAddr({
        serviceName: remoteServiceName,
        host: new InetAddress(config.host),
        port: config.port
      }));
      tracer.recordRpc(`query ${config.database}`);
    });

    const promise = originalFn.call(this, sql, values, callback);

    promise.on('end', () => {
      tracer.letId(id, () => {
        tracer.recordAnnotation(new Annotation.ClientRecv());
      });
    });

    promise.on('error', (error) => {
      tracer.letId(id, () => {
        tracer.recordBinary('error', error.toString());
        tracer.recordAnnotation(new Annotation.ClientRecv());
      });
    });

    return promise;
  };

  return Connection;
}

function getZipkinMysql(Mysql, tracer) {
  const ZipkinMysql = Object.assign({}, Mysql, {
    createConnection(config) {
      const Connection = Mysql.createConnection(config);

      return createMysqlTracer(config, tracer, Connection, tracer.localEndpoint.serviceName, `mysql-${config.database}`);
    },
    createPool(config) {
      const Connection = Mysql.createPool(config);

      return createMysqlTracer(config, tracer, Connection, tracer.localEndpoint.serviceName, `mysql-${config.database}`);
    }
  });

  return ZipkinMysql;
}

module.exports = getZipkinMysql;
