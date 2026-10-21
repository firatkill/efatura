import { XMLParser } from 'fast-xml-parser';

export const xmlParser = new XMLParser({
  preserveOrder: true,
  maxNestedTags: Number.POSITIVE_INFINITY,
  ignoreAttributes: false,
  attributeNamePrefix: '',
  attributesGroupName: false,
  allowBooleanAttributes: false,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: false,
  removeNSPrefix: false,
  processEntities: false,
  htmlEntities: false,
  ignoreDeclaration: true,
  ignorePiTags: true,
  cdataPropName: '#cdata',
  commentPropName: false,
});
