import Editor from "../../../components/Dnd/editor";
import "../../../ui/global.css";

export default function Page() {
  return (
    <main>
      <Editor gridRow={34} gridColumn={22} gridScale={34} gridPadding={22} />
      <div className="mobile-tips">
        <p>请使用PC访问，以获得更好的使用效果</p>
        <p>Please use a PC to access for better results</p>
      </div>
    </main>
  );
}
