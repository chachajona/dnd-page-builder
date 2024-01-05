const idGenerator = (): string => {
  return Math.floor(Math.random() * 1000001).toString();
};

export default idGenerator;
