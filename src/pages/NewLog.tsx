import LogForm from "@/components/log/LogForm";

const NewLog = () => {
  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-black mb-4">Novo Registro</h1>
      <div className="glass-card p-5 animate-fade-in">
        <LogForm />
      </div>
    </div>
  );
};

export default NewLog;
