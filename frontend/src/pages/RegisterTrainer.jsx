import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const ACCEPTED_LICENSE_TYPES = ".pdf,.doc,.docx";

export default function RegisterTrainer() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    address: "",
    phone: "",
    education: "",
  });
  const [courseInput, setCourseInput] = useState("");
  const [courses, setCourses] = useState([]);
  const [licenseFile, setLicenseFile] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function addCourse() {
    const trimmed = courseInput.trim();
    if (trimmed && !courses.includes(trimmed)) {
      setCourses((prev) => [...prev, trimmed]);
    }
    setCourseInput("");
  }

  function handleCourseKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addCourse();
    }
  }

  function removeCourse(course) {
    setCourses((prev) => prev.filter((c) => c !== course));
  }

  function handleLicenseChange(event) {
    setLicenseFile(event.target.files?.[0] ?? null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    // TODO: povezati sa backendom kada API bude spreman
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Registracija — trener
        </h1>
        <p className="mt-2 text-muted-foreground">
          Popuni svoje podatke. Admin tim proverava školovanje, kurseve i
          licencu pre odobravanja naloga.
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="text-sm font-medium leading-none text-foreground"
                >
                  Ime
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Marko"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="text-sm font-medium leading-none text-foreground"
                >
                  Prezime
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Petrović"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-sm font-medium leading-none text-foreground"
                >
                  Korisničko ime
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="npr. marko.trener"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none text-foreground"
                >
                  Lozinka
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="address"
                  className="text-sm font-medium leading-none text-foreground"
                >
                  Adresa
                </label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="Ulica i broj, grad"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-sm font-medium leading-none text-foreground"
                >
                  Broj telefona
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+381 6X XXX XXXX"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="education"
                className="text-sm font-medium leading-none text-foreground"
              >
                Školovanje
              </label>
              <Textarea
                id="education"
                name="education"
                placeholder="npr. Fakultet sporta i fizičkog vaspitanja — diplomirani profesor fizičkog vaspitanja"
                value={formData.education}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                Navedi školu/fakultet i stepen obrazovanja koji si završio/la.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="courseInput"
                className="text-sm font-medium leading-none text-foreground"
              >
                Kursevi i sertifikati
              </label>
              <div className="flex gap-2">
                <Input
                  id="courseInput"
                  type="text"
                  placeholder="npr. NSCA CPT"
                  value={courseInput}
                  onChange={(event) => setCourseInput(event.target.value)}
                  onKeyDown={handleCourseKeyDown}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addCourse}
                  aria-label="Dodaj kurs"
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {courses.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {courses.map((course) => (
                    <Badge key={course} variant="secondary" className="gap-1 py-1 pr-1">
                      {course}
                      <button
                        type="button"
                        onClick={() => removeCourse(course)}
                        aria-label={`Ukloni ${course}`}
                        className="ml-1 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="license"
                className="text-sm font-medium leading-none text-foreground"
              >
                Licenca ili diploma
              </label>
              <Input
                id="license"
                name="license"
                type="file"
                accept={ACCEPTED_LICENSE_TYPES}
                onChange={handleLicenseChange}
              />
              <p className="text-xs text-muted-foreground">
                Prihvaćeni formati: PDF, DOC, DOCX.
                {licenseFile ? ` Izabran fajl: ${licenseFile.name}` : ""}
              </p>
            </div>

            <Button type="submit" className="w-full">
              Pošalji zahtev za registraciju
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Već imaš nalog?{" "}
            <Link to="/auth" className="font-medium text-primary hover:underline">
              Prijavi se
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}