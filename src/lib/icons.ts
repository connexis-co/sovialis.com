/**
 * Iconos del sitio (Lucide, ISC) renderizados como SVG en el servidor: cero JS en el navegador.
 * Las claves en español son las que usa el CMS (campos «Icono» de bloques y servicios).
 */
import {
	ArrowLeft, ArrowRight, BadgeCheck, Bed, Brain, BriefcaseMedical, Calendar, Check, ChevronDown, ChevronRight,
	CircleHelp, ClipboardList, Clock, Coffee, Compass, FileText, HandHeart, Heart, House, Hospital, Mail, MapPin,
	Medal, Menu, MessageCircle, Moon, Phone, Pill, Plus, Quote, Search, ShieldCheck, Sparkles, Star, Sun, Users,
	User, Accessibility, X, Bandage, Activity,
} from "lucide-static";

const WHATSAPP =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor"><path d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.94 12.94 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.62c-2 0-3.95-.54-5.65-1.55l-.4-.24-3.96 1.04 1.06-3.86-.26-.4A10.6 10.6 0 0 1 5.4 16c0-5.86 4.77-10.63 10.64-10.63 5.86 0 10.6 4.77 10.6 10.63 0 5.87-4.76 10.62-10.6 10.62Zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.3-.1-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59a9.6 9.6 0 0 1-1.78-2.2c-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.3.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.08 1.3 3.3.16.2 2.25 3.43 5.45 4.81.76.33 1.36.53 1.82.67.77.25 1.46.21 2.01.13.61-.09 1.89-.77 2.15-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z"/></svg>';

export const ICONS: Record<string, string> = {
	corazon: Heart,
	escudo: ShieldCheck,
	reloj: Clock,
	luna: Moon,
	sol: Sun,
	casa: House,
	hospital: Hospital,
	calendario: Calendar,
	usuarios: Users,
	usuario: User,
	estrella: Star,
	check: Check,
	telefono: Phone,
	whatsapp: WHATSAPP,
	ubicacion: MapPin,
	cerebro: Brain,
	venda: Bandage,
	manos: HandHeart,
	cama: Bed,
	"silla-ruedas": Accessibility,
	documento: FileText,
	chat: MessageCircle,
	sparkles: Sparkles,
	medalla: Medal,
	familia: Users,
	cafe: Coffee,
	pastillas: Pill,
	brujula: Compass,
	maletin: BriefcaseMedical,
	lista: ClipboardList,
	pulso: Activity,
	verificado: BadgeCheck,
	ayuda: CircleHelp,
	correo: Mail,
	buscar: Search,
	menu: Menu,
	cerrar: X,
	mas: Plus,
	cita: Quote,
	"flecha-derecha": ArrowRight,
	"flecha-izquierda": ArrowLeft,
	"chevron-abajo": ChevronDown,
	"chevron-derecha": ChevronRight,
};

/** Devuelve el SVG sin dimensiones fijas (las pone el CSS), con aria-hidden. */
export function icon(name: string | null | undefined, className = "size-6"): string {
	const svg = ICONS[name ?? ""] ?? ICONS.corazon!;
	return svg
		.replace(/\s(width|height)="\d+"/g, "")
		.replace(/class="[^"]*"/, "")
		.replace("<svg", `<svg class="${className}" aria-hidden="true" focusable="false"`)
		.replace(/\n\s*/g, " ");
}
