'use strict';
export var validate = (function() {
  var refVal = [];
  return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
    'use strict'; /*# sourceURL=data://schema/config */
    var vErrors = null;
    var errors = 0;
    if ((data && typeof data === "object" && !Array.isArray(data))) {
      if (true) {
        var errs__0 = errors;
        var valid1 = true;
        for (var key0 in data) {
          var isAdditional0 = !(false || key0 == 'lists' || key0 == 'jenkins' || key0 == 'boards' || key0 == 'url' || key0 == 'cleanup' || key0 == 'maximumIssues');
          if (isAdditional0) {
            valid1 = false;
            validate.errors = [{
              keyword: 'additionalProperties',
              dataPath: (dataPath || '') + "",
              schemaPath: '#/additionalProperties',
              params: {
                additionalProperty: '' + key0 + ''
              },
              message: 'should NOT have additional properties'
            }];
            return false;
            break;
          }
        }
        if (valid1) {
          var data1 = data.lists;
          if (data1 === undefined) {
            valid1 = false;
            validate.errors = [{
              keyword: 'required',
              dataPath: (dataPath || '') + "",
              schemaPath: '#/required',
              params: {
                missingProperty: 'lists'
              },
              message: 'should have required property \'lists\''
            }];
            return false;
          } else {
            var errs_1 = errors;
            if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
              var errs__1 = errors;
              var valid2 = true;
            } else {
              validate.errors = [{
                keyword: 'type',
                dataPath: (dataPath || '') + '.lists',
                schemaPath: '#/properties/lists/type',
                params: {
                  type: 'object'
                },
                message: 'should be object'
              }];
              return false;
            }
            var valid1 = errors === errs_1;
          }
          if (valid1) {
            var data1 = data.jenkins;
            if (data1 === undefined) {
              valid1 = false;
              validate.errors = [{
                keyword: 'required',
                dataPath: (dataPath || '') + "",
                schemaPath: '#/required',
                params: {
                  missingProperty: 'jenkins'
                },
                message: 'should have required property \'jenkins\''
              }];
              return false;
            } else {
              var errs_1 = errors;
              if (Array.isArray(data1)) {
                var errs__1 = errors;
                var valid1;
                for (var i1 = 0; i1 < data1.length; i1++) {
                  var data2 = data1[i1];
                  var errs_2 = errors;
                  if ((data2 && typeof data2 === "object" && !Array.isArray(data2))) {
                    if (true) {
                      var errs__2 = errors;
                      var valid3 = true;
                      for (var key2 in data2) {
                        var isAdditional2 = !(false || key2 == 'name' || key2 == 'job' || key2 == 'type');
                        if (isAdditional2) {
                          valid3 = false;
                          validate.errors = [{
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + '.jenkins[' + i1 + ']',
                            schemaPath: '#/properties/jenkins/items/additionalProperties',
                            params: {
                              additionalProperty: '' + key2 + ''
                            },
                            message: 'should NOT have additional properties'
                          }];
                          return false;
                          break;
                        }
                      }
                      if (valid3) {
                        if (data2.name === undefined) {
                          valid3 = false;
                          validate.errors = [{
                            keyword: 'required',
                            dataPath: (dataPath || '') + '.jenkins[' + i1 + ']',
                            schemaPath: '#/properties/jenkins/items/required',
                            params: {
                              missingProperty: 'name'
                            },
                            message: 'should have required property \'name\''
                          }];
                          return false;
                        } else {
                          var errs_3 = errors;
                          if (typeof data2.name !== "string") {
                            validate.errors = [{
                              keyword: 'type',
                              dataPath: (dataPath || '') + '.jenkins[' + i1 + '].name',
                              schemaPath: '#/properties/jenkins/items/properties/name/type',
                              params: {
                                type: 'string'
                              },
                              message: 'should be string'
                            }];
                            return false;
                          }
                          var valid3 = errors === errs_3;
                        }
                        if (valid3) {
                          if (data2.job === undefined) {
                            valid3 = false;
                            validate.errors = [{
                              keyword: 'required',
                              dataPath: (dataPath || '') + '.jenkins[' + i1 + ']',
                              schemaPath: '#/properties/jenkins/items/required',
                              params: {
                                missingProperty: 'job'
                              },
                              message: 'should have required property \'job\''
                            }];
                            return false;
                          } else {
                            var errs_3 = errors;
                            if (typeof data2.job !== "string") {
                              validate.errors = [{
                                keyword: 'type',
                                dataPath: (dataPath || '') + '.jenkins[' + i1 + '].job',
                                schemaPath: '#/properties/jenkins/items/properties/job/type',
                                params: {
                                  type: 'string'
                                },
                                message: 'should be string'
                              }];
                              return false;
                            }
                            var valid3 = errors === errs_3;
                          }
                          if (valid3) {
                            if (data2.type === undefined) {
                              valid3 = false;
                              validate.errors = [{
                                keyword: 'required',
                                dataPath: (dataPath || '') + '.jenkins[' + i1 + ']',
                                schemaPath: '#/properties/jenkins/items/required',
                                params: {
                                  missingProperty: 'type'
                                },
                                message: 'should have required property \'type\''
                              }];
                              return false;
                            } else {
                              var errs_3 = errors;
                              if (typeof data2.type !== "string") {
                                validate.errors = [{
                                  keyword: 'type',
                                  dataPath: (dataPath || '') + '.jenkins[' + i1 + '].type',
                                  schemaPath: '#/properties/jenkins/items/properties/type/type',
                                  params: {
                                    type: 'string'
                                  },
                                  message: 'should be string'
                                }];
                                return false;
                              }
                              var valid3 = errors === errs_3;
                            }
                          }
                        }
                      }
                    }
                  } else {
                    validate.errors = [{
                      keyword: 'type',
                      dataPath: (dataPath || '') + '.jenkins[' + i1 + ']',
                      schemaPath: '#/properties/jenkins/items/type',
                      params: {
                        type: 'object'
                      },
                      message: 'should be object'
                    }];
                    return false;
                  }
                  var valid2 = errors === errs_2;
                  if (!valid2) break;
                }
              } else {
                validate.errors = [{
                  keyword: 'type',
                  dataPath: (dataPath || '') + '.jenkins',
                  schemaPath: '#/properties/jenkins/type',
                  params: {
                    type: 'array'
                  },
                  message: 'should be array'
                }];
                return false;
              }
              var valid1 = errors === errs_1;
            }
            if (valid1) {
              var data1 = data.boards;
              if (data1 === undefined) {
                valid1 = false;
                validate.errors = [{
                  keyword: 'required',
                  dataPath: (dataPath || '') + "",
                  schemaPath: '#/required',
                  params: {
                    missingProperty: 'boards'
                  },
                  message: 'should have required property \'boards\''
                }];
                return false;
              } else {
                var errs_1 = errors;
                if (Array.isArray(data1)) {
                  var errs__1 = errors;
                  var valid1;
                  for (var i1 = 0; i1 < data1.length; i1++) {
                    var data2 = data1[i1];
                    var errs_2 = errors;
                    if ((data2 && typeof data2 === "object" && !Array.isArray(data2))) {
                      if (true) {
                        var errs__2 = errors;
                        var valid3 = true;
                        for (var key2 in data2) {
                          var isAdditional2 = !(false || key2 == 'id' || key2 == 'key');
                          if (isAdditional2) {
                            valid3 = false;
                            validate.errors = [{
                              keyword: 'additionalProperties',
                              dataPath: (dataPath || '') + '.boards[' + i1 + ']',
                              schemaPath: '#/properties/boards/items/additionalProperties',
                              params: {
                                additionalProperty: '' + key2 + ''
                              },
                              message: 'should NOT have additional properties'
                            }];
                            return false;
                            break;
                          }
                        }
                        if (valid3) {
                          var data3 = data2.id;
                          if (data3 === undefined) {
                            valid3 = false;
                            validate.errors = [{
                              keyword: 'required',
                              dataPath: (dataPath || '') + '.boards[' + i1 + ']',
                              schemaPath: '#/properties/boards/items/required',
                              params: {
                                missingProperty: 'id'
                              },
                              message: 'should have required property \'id\''
                            }];
                            return false;
                          } else {
                            var errs_3 = errors;
                            if ((typeof data3 !== "number" || (data3 % 1) || data3 !== data3)) {
                              validate.errors = [{
                                keyword: 'type',
                                dataPath: (dataPath || '') + '.boards[' + i1 + '].id',
                                schemaPath: '#/properties/boards/items/properties/id/type',
                                params: {
                                  type: 'integer'
                                },
                                message: 'should be integer'
                              }];
                              return false;
                            }
                            var valid3 = errors === errs_3;
                          }
                          if (valid3) {
                            if (data2.key === undefined) {
                              valid3 = false;
                              validate.errors = [{
                                keyword: 'required',
                                dataPath: (dataPath || '') + '.boards[' + i1 + ']',
                                schemaPath: '#/properties/boards/items/required',
                                params: {
                                  missingProperty: 'key'
                                },
                                message: 'should have required property \'key\''
                              }];
                              return false;
                            } else {
                              var errs_3 = errors;
                              if (typeof data2.key !== "string") {
                                validate.errors = [{
                                  keyword: 'type',
                                  dataPath: (dataPath || '') + '.boards[' + i1 + '].key',
                                  schemaPath: '#/properties/boards/items/properties/key/type',
                                  params: {
                                    type: 'string'
                                  },
                                  message: 'should be string'
                                }];
                                return false;
                              }
                              var valid3 = errors === errs_3;
                            }
                          }
                        }
                      }
                    } else {
                      validate.errors = [{
                        keyword: 'type',
                        dataPath: (dataPath || '') + '.boards[' + i1 + ']',
                        schemaPath: '#/properties/boards/items/type',
                        params: {
                          type: 'object'
                        },
                        message: 'should be object'
                      }];
                      return false;
                    }
                    var valid2 = errors === errs_2;
                    if (!valid2) break;
                  }
                } else {
                  validate.errors = [{
                    keyword: 'type',
                    dataPath: (dataPath || '') + '.boards',
                    schemaPath: '#/properties/boards/type',
                    params: {
                      type: 'array'
                    },
                    message: 'should be array'
                  }];
                  return false;
                }
                var valid1 = errors === errs_1;
              }
              if (valid1) {
                if (data.url === undefined) {
                  valid1 = false;
                  validate.errors = [{
                    keyword: 'required',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/required',
                    params: {
                      missingProperty: 'url'
                    },
                    message: 'should have required property \'url\''
                  }];
                  return false;
                } else {
                  var errs_1 = errors;
                  if (typeof data.url !== "string") {
                    validate.errors = [{
                      keyword: 'type',
                      dataPath: (dataPath || '') + '.url',
                      schemaPath: '#/properties/url/type',
                      params: {
                        type: 'string'
                      },
                      message: 'should be string'
                    }];
                    return false;
                  }
                  var valid1 = errors === errs_1;
                }
                if (valid1) {
                  var data1 = data.cleanup;
                  if (data1 === undefined) {
                    valid1 = false;
                    validate.errors = [{
                      keyword: 'required',
                      dataPath: (dataPath || '') + "",
                      schemaPath: '#/required',
                      params: {
                        missingProperty: 'cleanup'
                      },
                      message: 'should have required property \'cleanup\''
                    }];
                    return false;
                  } else {
                    var errs_1 = errors;
                    if ((typeof data1 !== "number" || (data1 % 1) || data1 !== data1)) {
                      validate.errors = [{
                        keyword: 'type',
                        dataPath: (dataPath || '') + '.cleanup',
                        schemaPath: '#/properties/cleanup/type',
                        params: {
                          type: 'integer'
                        },
                        message: 'should be integer'
                      }];
                      return false;
                    }
                    if (typeof data1 === "number") {
                      if (data1 > 30 || data1 !== data1) {
                        validate.errors = [{
                          keyword: 'maximum',
                          dataPath: (dataPath || '') + '.cleanup',
                          schemaPath: '#/properties/cleanup/maximum',
                          params: {
                            comparison: '<=',
                            limit: 30,
                            exclusive: false
                          },
                          message: 'should be <= 30'
                        }];
                        return false;
                      } else {
                        if (data1 < 1 || data1 !== data1) {
                          validate.errors = [{
                            keyword: 'minimum',
                            dataPath: (dataPath || '') + '.cleanup',
                            schemaPath: '#/properties/cleanup/minimum',
                            params: {
                              comparison: '>=',
                              limit: 1,
                              exclusive: false
                            },
                            message: 'should be >= 1'
                          }];
                          return false;
                        }
                      }
                    }
                    var valid1 = errors === errs_1;
                  }
                  if (valid1) {
                    var data1 = data.maximumIssues;
                    if (data1 === undefined) {
                      valid1 = false;
                      validate.errors = [{
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                          missingProperty: 'maximumIssues'
                        },
                        message: 'should have required property \'maximumIssues\''
                      }];
                      return false;
                    } else {
                      var errs_1 = errors;
                      if ((typeof data1 !== "number" || (data1 % 1) || data1 !== data1)) {
                        validate.errors = [{
                          keyword: 'type',
                          dataPath: (dataPath || '') + '.maximumIssues',
                          schemaPath: '#/properties/maximumIssues/type',
                          params: {
                            type: 'integer'
                          },
                          message: 'should be integer'
                        }];
                        return false;
                      }
                      if (typeof data1 === "number") {
                        if (data1 > 18 || data1 !== data1) {
                          validate.errors = [{
                            keyword: 'maximum',
                            dataPath: (dataPath || '') + '.maximumIssues',
                            schemaPath: '#/properties/maximumIssues/maximum',
                            params: {
                              comparison: '<=',
                              limit: 18,
                              exclusive: false
                            },
                            message: 'should be <= 18'
                          }];
                          return false;
                        } else {
                          if (data1 < 0 || data1 !== data1) {
                            validate.errors = [{
                              keyword: 'minimum',
                              dataPath: (dataPath || '') + '.maximumIssues',
                              schemaPath: '#/properties/maximumIssues/minimum',
                              params: {
                                comparison: '>=',
                                limit: 0,
                                exclusive: false
                              },
                              message: 'should be >= 0'
                            }];
                            return false;
                          }
                        }
                      }
                      var valid1 = errors === errs_1;
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate.errors = [{
        keyword: 'type',
        dataPath: (dataPath || '') + "",
        schemaPath: '#/type',
        params: {
          type: 'object'
        },
        message: 'should be object'
      }];
      return false;
    }
    validate.errors = vErrors;
    return errors === 0;
  };
})();
validate.schema = {
  "id": "data://schema/config",
  "type": "object",
  "properties": {
    "lists": {
      "type": "object",
      "properties": {
        "developer": {
          "ref": "data://schema/lists"
        },
        "tester": {
          "ref": "data://schema/lists"
        },
        "reviewer": {
          "ref": "data://schema/lists"
        },
        "help": {
          "ref": "data://schema/lists"
        }
      }
    },
    "jenkins": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "job": {
            "type": "string"
          },
          "type": {
            "type": "string"
          }
        },
        "additionalProperties": false,
        "required": ["name", "job", "type"]
      }
    },
    "boards": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer"
          },
          "key": {
            "type": "string"
          }
        },
        "additionalProperties": false,
        "required": ["id", "key"]
      }
    },
    "url": {
      "type": "string"
    },
    "cleanup": {
      "type": "integer",
      "minimum": 1,
      "maximum": 30
    },
    "maximumIssues": {
      "type": "integer",
      "minimum": 0,
      "maximum": 18
    }
  },
  "additionalProperties": false,
  "required": ["lists", "jenkins", "boards", "url", "cleanup", "maximumIssues"]
};
validate.errors = null;
