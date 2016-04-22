/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
var expect = require('chai').expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire');

describe('kinesisExporter', function () {
  it('calls everything correctly', function (done) {
    var exporteradd = sinon.spy();
    var exporter = sinon.stub().returns({ add: exporteradd });
    var parser = sinon.stub().returns('parsed');
    var formatter = sinon.stub().returns('formatted');
    var ApiaxleKinesis = proxyquire('../../processors/apiaxleKinesis.js', {
      '../exporters/kinesisExporter.js': exporter,
      '../parsers/apiaxleParser.js': parser,
      '../formatters/trafficSpaces.js': formatter
    });

    process.env.FIREHOSE_STREAM = 'teststream';
    var processor = new ApiaxleKinesis();
    processor.processHit('simplehit', function () {
      expect(exporter.calledWith('teststream')).to.be.true;
      expect(parser.calledWith('simplehit')).to.be.true;
      expect(formatter.calledWith('parsed')).to.be.true;
      expect(exporteradd.calledWith('formatted')).to.be.true;
      done();
    });
  });

  it('catches errors', function (done) {
    var exporteradd = sinon.spy();
    var exporter = sinon.stub().returns({ add: exporteradd });
    var parser = sinon.stub().throws('intentional error');
    var formatter = sinon.stub().returns('formatted');
    var ApiaxleKinesis = proxyquire('../../processors/apiaxleKinesis.js', {
      '../exporters/kinesisExporter.js': exporter,
      '../parsers/apiaxleParser.js': parser,
      '../formatters/trafficSpaces.js': formatter
    });

    var processor = new ApiaxleKinesis();
    expect(processor.processHit('simplehit', done)).to.not.throw.errors;
  });
});
