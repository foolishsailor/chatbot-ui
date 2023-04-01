//import local from './localDb';

type DataType = 'local' | 'atlas' | 'stich' | 'plsql';

type DataServiceLiteral = {
  [key in DataType]: any;
};

const dataServiceLiteral: DataServiceLiteral = {
  local: 'local',
  atlas: 'atlas',
  stich: 'stich',
  plsql: 'plsql',
};

const dataInterface = () => {
  if (!process.env.DATA_INTERFACE) return null;

  const dataInterfaceType: DataType = process.env.DATA_INTERFACE as DataType;

  return dataServiceLiteral[dataInterfaceType];
};

export default dataInterface;
