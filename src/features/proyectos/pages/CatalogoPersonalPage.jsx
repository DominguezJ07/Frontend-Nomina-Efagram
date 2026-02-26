import { useState } from "react";

export default function CatalogoPersonalPage() {
  const [personal, setPersonal] = useState([
    { id: 1, nombre: "Juan Pérez", cargo: "Supervisor" },
    { id: 2, nombre: "María Gómez", cargo: "Técnico" },
  ]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Catálogo de Personal</h1>

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Cargo</th>
          </tr>
        </thead>
        <tbody>
          {personal.map((p) => (
            <tr key={p.id}>
              <td className="p-2 border">{p.nombre}</td>
              <td className="p-2 border">{p.cargo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}