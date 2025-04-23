export default function Foo() {
  return (
    <>
      <div>Foo Component</div>
      <Bar />
      <Qux></Qux>
    </>
  );
}

const Bar = () => {
  return (
    <>
      <div>Bar Component</div>
      <Baz />
    </>
  );
};

const Baz = () => {
  return <div>Baz Component</div>;
};

const Qux = () => {
  return <div>Qux Component</div>;
};
