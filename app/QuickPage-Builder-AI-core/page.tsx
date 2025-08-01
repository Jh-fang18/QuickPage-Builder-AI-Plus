import Edit from "./components/Dnd/Edit";
import "./ui/main.css";

export default function Page() {
  const microParts = {};

  return (
    <main>
      <Edit microParts={microParts} v-if="true" />
      <div className="mobile-tips">
        <p>请使用PC访问，以获得更好的使用效果</p>
        <p>Please use a PC to access for better results</p>
      </div>
    </main>
  );
}
