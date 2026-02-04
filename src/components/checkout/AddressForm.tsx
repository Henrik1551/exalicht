import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

const addressSchema = z.object({
  street: z.string().min(3, 'Straße ist erforderlich'),
  city: z.string().min(2, 'Stadt ist erforderlich'),
  postalCode: z.string().min(4, 'Postleitzahl ist erforderlich'),
  country: z.string().min(2, 'Land ist erforderlich'),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  title: string;
  defaultValues?: Partial<AddressFormValues>;
  onValuesChange: (values: AddressFormValues, isValid: boolean) => void;
}

const countries = [
  { code: 'DE', name: { de: 'Deutschland', en: 'Germany' } },
  { code: 'AT', name: { de: 'Österreich', en: 'Austria' } },
  { code: 'CH', name: { de: 'Schweiz', en: 'Switzerland' } },
  { code: 'NL', name: { de: 'Niederlande', en: 'Netherlands' } },
  { code: 'BE', name: { de: 'Belgien', en: 'Belgium' } },
  { code: 'FR', name: { de: 'Frankreich', en: 'France' } },
  { code: 'PL', name: { de: 'Polen', en: 'Poland' } },
  { code: 'CZ', name: { de: 'Tschechien', en: 'Czech Republic' } },
];

export function AddressForm({ title, defaultValues, onValuesChange }: AddressFormProps) {
  const { language } = useLanguage();

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: '',
      city: '',
      postalCode: '',
      country: 'DE',
      ...defaultValues,
    },
    mode: 'onChange',
  });

  // Watch for changes and validate
  form.watch((values) => {
    const result = addressSchema.safeParse(values);
    onValuesChange(values as AddressFormValues, result.success);
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {language === 'de' ? 'Straße und Hausnummer' : 'Street Address'}
                </FormLabel>
                <FormControl>
                  <Input placeholder="Musterstraße 123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'de' ? 'PLZ' : 'Postal Code'}</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'de' ? 'Stadt' : 'City'}</FormLabel>
                  <FormControl>
                    <Input placeholder="Berlin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{language === 'de' ? 'Land' : 'Country'}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'de' ? 'Land auswählen' : 'Select country'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name[language]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
